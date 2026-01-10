import { makeGitHubRequest } from "../../lib/misc";

export class GitHubClient {
  private accessToken: string;
  private me?: { login: string };

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async getMe() {
    if (!this.me) {
      this.me = await makeGitHubRequest(
        "/user",
        "GET",
        undefined,
        this.accessToken
      );
    }
    return this.me;
  }

  async getNotifications(all = false, participating = false) {
    return makeGitHubRequest(
      `/notifications?all=${all}&participating=${participating}`,
      "GET",
      undefined,
      this.accessToken
    );
  }

  async getPullRequests(state: "open" | "closed" | "all") {
    const me = await this.getMe();

    if (!me) throw new Error("Unable to fetch user info from GitHub");

    return makeGitHubRequest(
      `/search/issues?q=is:pr+involves:${me?.login}+state:${state}`,
      "GET",
      undefined,
      this.accessToken
    );
  }

  async getIssues(state: "open" | "closed" | "all") {
    const me = await this.getMe();

    if (!me) throw new Error("Unable to fetch user info from GitHub");

    return makeGitHubRequest(
      `/search/issues?q=is:issue+involves:${me?.login}+state:${state}`,
      "GET",
      undefined,
      this.accessToken
    );
  }

  async getAssignedIssues(state: "open" | "closed" | "all") {
    const me = await this.getMe();

    if (!me) throw new Error("Unable to fetch user info from GitHub");

    return makeGitHubRequest(
      `/search/issues?q=is:issue+assignee:${me?.login}+state:${state}`,
      "GET",
      undefined,
      this.accessToken
    );
  }
}
