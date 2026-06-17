export interface GitHubProfileSummary {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface GitHubActivityEvent {
  id: string;
  type: string;
  createdAt: string;
  repoName: string;
  repoUrl: string;
  summary: string;
}

export interface GitHubActivityPayload {
  profile: GitHubProfileSummary;
  events: GitHubActivityEvent[];
  fetchedAt: string;
}
