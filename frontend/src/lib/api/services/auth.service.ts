import { authActions } from "@/store/action";
import { apiClient, refreshAccessToken } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeAuthResponse, normalizeUser } from "../normalizers";
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "../types";

export const authService = {
  /** Email + password login. Persists the session on success. */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.login, dto);
    const auth = normalizeAuthResponse(data);
    authActions.setSession(auth);
    return auth;
  },

  /** Create a new account and start a session. */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.register, dto);
    const auth = normalizeAuthResponse(data);
    authActions.setSession(auth);
    return auth;
  },

  /** Request a password-reset email. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, dto);
  },

  /** Complete a password reset with the emailed token. */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, dto);
  },

  async refresh(): Promise<boolean> {
    return refreshAccessToken();
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } finally {
      authActions.clearSession();
    }
  },

  /** Current authenticated user (GET /users/me). */
  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get(API_ENDPOINTS.users.me);
    return normalizeUser(data);
  },
};
