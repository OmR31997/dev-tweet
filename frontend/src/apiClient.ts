import { connectSocket, disconnectSocket } from './socketClient';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window as Window & { __DTH_API_URL__?: string }).__DTH_API_URL__) ||
  'http://localhost:4000';

function isLikelyCorsOrNetworkBlock(err: unknown): boolean {
  return err instanceof TypeError;
}

function devProxyHint(): string {
  return (
    ' If you are calling a remote API from the Vite dev server, the browser may block it (CORS). ' +
    'Use same-origin proxy: set VITE_API_URL=/api and API_PROXY_TARGET to your backend base URL in .env.development (see .env.example).'
  );
}

function rethrowFetchError(err: unknown): never {
  if (import.meta.env.DEV && isLikelyCorsOrNetworkBlock(err)) {
    const base = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to reach the API (${base}).${devProxyHint()}`);
  }
  throw err;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

type SessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
  };
};

type AuthListener = (user: User | null) => void;

const ACCESS_TOKEN_KEY = 'dth_access_token';
const REFRESH_TOKEN_KEY = 'dth_refresh_token';

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY);

function setSession(session: SessionResponse) {
  accessToken = session.accessToken;
  refreshToken = session.refreshToken;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  auth.currentUser = {
    uid: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    photoURL: session.user.photoURL,
  };
  connectSocket(session.accessToken);
}

function clearSession() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  auth.currentUser = null;
  disconnectSocket();
}

const listeners = new Set<AuthListener>();
function notifyAuthListeners() {
  for (const listener of listeners) listener(auth.currentUser);
}

export const auth: { currentUser: User | null } = { currentUser: null };
export const googleProvider = {};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { authRequired?: boolean } = {},
): Promise<T> {
  const authRequired = options.authRequired ?? true;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authRequired && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch (err) {
    rethrowFetchError(err);
  }
  if (res.status === 401 && authRequired && accessToken && refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      try {
        res = await doFetch();
      } catch (err) {
        rethrowFetchError(err);
      }
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const json = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(json.message)) message = json.message.join(', ');
      else if (typeof json.message === 'string') message = json.message;
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

async function refreshSession(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    let refreshRes: Response;
    try {
      refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      rethrowFetchError(err);
    }
    if (!refreshRes.ok) throw new Error('Session expired');
    const session = (await refreshRes.json()) as SessionResponse;
    setSession(session);
    notifyAuthListeners();
    return true;
  } catch {
    clearSession();
    notifyAuthListeners();
    return false;
  }
}

export function onAuthStateChanged(
  _auth: typeof auth,
  callback: (user: User | null) => void,
): () => void {
  listeners.add(callback);
  callback(auth.currentUser);

  if (!auth.currentUser && accessToken) {
    void (async () => {
      try {
        const me = await apiRequest<any>('/users/me');
        auth.currentUser = {
          uid: me._id ?? me.id,
          email: me.email,
          displayName: me.displayName,
          photoURL: me.photoURL,
        };
        if (accessToken) connectSocket(accessToken);
        notifyAuthListeners();
      } catch {
        clearSession();
        notifyAuthListeners();
      }
    })();
  }

  return () => {
    listeners.delete(callback);
  };
}

export function normalizeIdDocument<T extends Record<string, unknown>>(doc: T): T & { id: string; uid: string } {
  const id = String((doc._id ?? doc.id ?? doc.uid) as string);
  return { ...doc, id, uid: id };
}

export function normalizeDate<T extends Record<string, unknown>>(doc: T): T {
  const createdAt = doc.createdAt as unknown;
  const updatedAt = doc.updatedAt as unknown;
  return {
    ...doc,
    createdAt: createdAt ? new Date(createdAt as string) : undefined,
    updatedAt: updatedAt ? new Date(updatedAt as string) : undefined,
  };
}

export async function fetchPosts(query?: string, limit?: number) {
  const params = new URLSearchParams();
  if (query && query.trim()) params.set('q', query.trim());
  if (typeof limit === 'number' && Number.isFinite(limit)) params.set('limit', String(limit));
  const posts = await apiRequest<any[]>(`/posts${params.toString() ? `?${params.toString()}` : ''}`);
  return posts.map((p) => normalizeDate(normalizeIdDocument(p)));
}

export async function createPost(content: string, imageIds: string[] = []) {
  const tags = extractTags(content);
  const created = await apiRequest<any>('/posts', {
    method: 'POST',
    body: JSON.stringify({ content, tags, imageIds }),
  });
  return normalizeDate(normalizeIdDocument(created));
}

export async function uploadPostImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const headers = new Headers();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (err) {
    rethrowFetchError(err);
  }
  if (!res.ok) {
    throw new Error(`Image upload failed (${res.status})`);
  }
  return (await res.json()) as { id: string; url: string; filename: string };
}

export async function toggleLike(postId: string) {
  return apiRequest<{ liked: boolean }>(`/posts/${postId}/like`, { method: 'POST' });
}

export async function deletePostById(postId: string) {
  return apiRequest<{ ok: boolean; deletedImages: number }>(`/posts/${postId}`, { method: 'DELETE' });
}

export async function fetchUsers(query?: string, limit?: number) {
  const params = new URLSearchParams();
  if (query && query.trim()) params.set('q', query.trim());
  if (typeof limit === 'number' && Number.isFinite(limit)) params.set('limit', String(limit));
  const users = await apiRequest<any[]>(`/users${params.toString() ? `?${params.toString()}` : ''}`);
  return users.map((u) => normalizeDate(normalizeIdDocument(u)));
}

export async function fetchMe() {
  const me = await apiRequest<any>('/users/me');
  return normalizeDate(normalizeIdDocument(me));
}

export async function fetchUserById(userId: string) {
  const user = await apiRequest<any>(`/users/${userId}`);
  return normalizeDate(normalizeIdDocument(user));
}

export async function updateMe(payload: Record<string, unknown>) {
  const user = await apiRequest<any>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeDate(normalizeIdDocument(user));
}

export async function toggleFollow(targetUserId: string) {
  return apiRequest<{ following: boolean }>(`/users/${targetUserId}/follow`, { method: 'POST' });
}

export async function fetchNotifications() {
  const notifications = await apiRequest<any[]>('/notifications');
  return notifications.map((n) => normalizeDate(normalizeIdDocument(n)));
}

export async function markNotificationRead(id: string) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function clearNotifications() {
  return apiRequest<{ ok: boolean; deletedCount: number }>('/notifications/clear', { method: 'DELETE' });
}

export async function fetchConversation(otherUserId: string) {
  const messages = await apiRequest<any[]>(`/messages/${otherUserId}`);
  return messages.map((m) => normalizeDate(normalizeIdDocument(m)));
}

export async function sendMessage(recipientId: string, content: string) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify({ recipientId, content }),
  });
}

export async function clearConversation(otherUserId: string) {
  return apiRequest<{ ok: boolean; deletedCount: number }>(`/messages/${otherUserId}/clear`, {
    method: 'DELETE',
  });
}

export async function deleteMessageById(messageId: string) {
  return apiRequest<{ ok: boolean; deletedCount: number }>(`/messages/item/${messageId}`, {
    method: 'DELETE',
  });
}

export async function fetchUnreadMessageCount() {
  return apiRequest<{ count: number }>('/messages/unread/count');
}

export async function markConversationRead(otherUserId: string) {
  return apiRequest<{ ok: boolean; updatedCount: number }>(`/messages/${otherUserId}/read`, {
    method: 'POST',
  });
}

export async function signInWithEmailAndPassword(
  _auth: typeof auth,
  email: string,
  password: string,
): Promise<{ user: User }> {
  const session = await apiRequest<SessionResponse>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
    { authRequired: false },
  );
  setSession(session);
  notifyAuthListeners();
  return { user: auth.currentUser as User };
}

export async function createUserWithEmailAndPassword(
  _auth: typeof auth,
  email: string,
  password: string,
): Promise<{ user: User }> {
  const defaultName = email.split('@')[0] || 'Developer';
  const session = await apiRequest<SessionResponse>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, displayName: defaultName }) },
    { authRequired: false },
  );
  setSession(session);
  notifyAuthListeners();
  return { user: auth.currentUser as User };
}

export async function updateProfile(user: User, payload: { displayName?: string }) {
  const updated = await apiRequest<any>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  auth.currentUser = {
    uid: updated._id ?? updated.id ?? user.uid,
    email: updated.email ?? user.email,
    displayName: updated.displayName ?? user.displayName,
    photoURL: updated.photoURL ?? user.photoURL,
  };
  notifyAuthListeners();
}

export async function signOut(_auth: typeof auth) {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
    notifyAuthListeners();
  }
}

export async function signInWithPopup(_auth: typeof auth, _provider: unknown) {
  throw new Error('Google sign-in is not available yet. Please use email/password.');
}

function extractTags(content: string): string[] {
  const matches = content.match(/#[a-zA-Z0-9_]+/g) ?? [];
  const normalized = matches
    .map((tag) => tag.slice(1).toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 50);
  return Array.from(new Set(normalized));
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
