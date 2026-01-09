import { makeGitHubRequest } from "../../lib/githubapis";

export const listRepos = async (
  visibility: "all" | "public" | "private",
  access_token: string
) => {
  return makeGitHubRequest(
    `/user/repos?per_page=100&visibility=${visibility}`,
    "GET",
    undefined,
    access_token
  );
};

export const searchRepos = async (query: string, access_token: string) => {
  return makeGitHubRequest(
    `/search/repositories?q=${encodeURIComponent(query)}`,
    "GET",
    undefined,
    access_token
  );
};

export const searchGithub = async (
  query: string,
  type: "repositories" | "issues" | "pulls",
  access_token: string
) => {
  return makeGitHubRequest(
    `/search/${type}?q=${encodeURIComponent(query)}`,
    "GET",
    undefined,
    access_token
  );
};

export const getRepo = async (
  owner: string,
  repo: string,
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}`,
    "GET",
    undefined,
    access_token
  );
};

export const createRepo = async (
  args: { name: string; description?: string | null; private?: boolean },
  access_token: string
) => {
  return makeGitHubRequest("/user/repos", "POST", args, access_token);
};

export const deleteRepo = async (
  owner: string,
  repo: string,
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}`,
    "DELETE",
    undefined,
    access_token
  );
};

export const listPullRequests = async (
  owner: string,
  repo: string,
  state: "open" | "closed" | "all",
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}/pulls?state=${state}`,
    "GET",
    undefined,
    access_token
  );
};

export const searchPullRequests = async (
  query: string,
  access_token: string
) => {
  return makeGitHubRequest(
    `/search/issues?q=is:pr+${encodeURIComponent(query)}`,
    "GET",
    undefined,
    access_token
  );
};

export const createPullRequest = async (
  args: {
    owner: string;
    repo: string;
    title: string;
    head: string;
    base: string;
    body?: string | null;
  },
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${args.owner}/${args.repo}/pulls`,
    "POST",
    args,
    access_token
  );
};

export const mergePullRequest = async (
  owner: string,
  repo: string,
  pull_number: number,
  rest: {
    commit_title?: string | null;
    commit_message?: string | null;
    merge_method?: "merge" | "squash" | "rebase" | null;
  },
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
    "PUT",
    rest,
    access_token
  );
};

export const listIssues = async (
  filter: "assigned" | "created" | "mentioned" | "subscribed" | "all",
  state: "open" | "closed" | "all",
  access_token: string
) => {
  return makeGitHubRequest(
    `/issues?filter=${filter}&state=${state}`,
    "GET",
    undefined,
    access_token
  );
};

export const searchIssues = async (query: string, access_token: string) => {
  return makeGitHubRequest(
    `/search/issues?q=is:issue+${encodeURIComponent(query)}`,
    "GET",
    undefined,
    access_token
  );
};

export const createIssue = async (
  args: {
    owner: string;
    repo: string;
    title: string;
    body?: string | null;
  },
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${args.owner}/${args.repo}/issues`,
    "POST",
    args,
    access_token
  );
};

export const updateIssue = async (
  owner: string,
  repo: string,
  issue_number: number,
  rest: {
    title?: string | null;
    body?: string | null;
    state?: "open" | "closed" | null;
  },
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}`,
    "PATCH",
    rest,
    access_token
  );
};

export const commentOnIssue = async (
  owner: string,
  repo: string,
  issue_number: number,
  body: string | null,
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
    "POST",
    { body },
    access_token
  );
};

export const listIssueComments = async (
  owner: string,
  repo: string,
  issue_number: number,
  access_token: string
) => {
  return makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
    "GET",
    undefined,
    access_token
  );
};

export const listNotifications = async (
  all: boolean,
  participating: boolean,
  access_token: string
) => {
  return makeGitHubRequest(
    `/notifications?all=${all}&participating=${participating}`,
    "GET",
    undefined,
    access_token
  );
};

export const listInvitations = async (access_token: string) => {
  return makeGitHubRequest(
    "/user/repository_invitations",
    "GET",
    undefined,
    access_token
  );
};

export const acceptInvitation = async (
  invitation_id: number,
  access_token: string
) => {
  return makeGitHubRequest(
    `/user/repository_invitations/${invitation_id}`,
    "PATCH",
    undefined,
    access_token
  );
};

export const declineInvitation = async (
  invitation_id: number,
  access_token: string
) => {
  return makeGitHubRequest(
    `/user/repository_invitations/${invitation_id}`,
    "DELETE",
    undefined,
    access_token
  );
};
export const markAllNotificationsRead = async (access_token: string) => {
  return makeGitHubRequest(`/notifications`, "PUT", undefined, access_token);
};
