import { Agent } from "@openai/agents";
import * as githubTools from "../tools/github";
import { GITHUB_AGENT_PROMPT } from "../lib/prompts";
import { MODEL } from "../config/env";

const {
  listRepos,
  listIssues,
  createIssue,
  listPullRequests,
  mergePullRequest,
  commentOnIssue,
  createRepo,
  createPullRequest,
  deleteRepo,
  getRepo,
  listIssueComments,
  listNotifications,
  markAllNotificationsRead,
  searchIssues,
  searchPullRequests,
  searchRepos,
  updateIssue,
} = githubTools;

export const githubAgent = new Agent({
  name: "github_agent",
  instructions: GITHUB_AGENT_PROMPT,
  model: MODEL,
  tools: [
    listRepos,
    listIssues,
    createIssue,
    listPullRequests,
    mergePullRequest,
    commentOnIssue,
    createRepo,
    createPullRequest,
    deleteRepo,
    getRepo,
    listIssueComments,
    listNotifications,
    markAllNotificationsRead,
    searchIssues,
    searchPullRequests,
    searchRepos,
    updateIssue,
  ],
});
