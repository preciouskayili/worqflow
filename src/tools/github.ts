import { z } from "zod";
import { Types } from "mongoose";
import { tool, RunContext } from "@openai/agents";
import * as githubAdapters from "../services/adapters/github";
import { TIntegrations } from "../../types/integrations";

// --- REPOSITORIES ---
export const listRepos = tool({
  name: "list_repos",
  description: "List all GitHub repositories for the user",
  parameters: z.object({
    visibility: z.enum(["all", "public", "private"]).default("all"),
  }),
  execute: async ({ visibility }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.listRepos(visibility, access_token);
  },
});

export const searchRepos = tool({
  name: "search_repos",
  description: "Search repositories accessible to the user",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.searchRepos(query, access_token);
  },
});

export const searchGithub = tool({
  name: "search_github",
  description:
    "Search GitHub for repositories, issues, pull requests, and more",
  parameters: z.object({
    query: z.string(),
    type: z.enum(["repositories", "issues", "pulls"]).default("repositories"),
  }),
  execute: async ({ query, type }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.searchGithub(query, type, access_token);
  },
});

export const getRepo = tool({
  name: "get_repo",
  description: "Get a single repository's details",
  parameters: z.object({ owner: z.string(), repo: z.string() }),
  execute: async ({ owner, repo }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.getRepo(owner, repo, access_token);
  },
});

export const createRepo = tool({
  name: "create_repo",
  description: "Create a new GitHub repository",
  parameters: z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    private: z.boolean().default(false),
  }),
  execute: async (args, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.createRepo(args, access_token);
  },
});

export const deleteRepo = tool({
  name: "delete_repo",
  description: "Delete a repository",
  parameters: z.object({ owner: z.string(), repo: z.string() }),
  execute: async ({ owner, repo }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.deleteRepo(owner, repo, access_token);
  },
});

// --- PULL REQUESTS ---

export const listPullRequests = tool({
  name: "list_pull_requests",
  description: "List pull requests in a repository",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    state: z.enum(["open", "closed", "all"]).default("open"),
  }),
  execute: async ({ owner, repo, state }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.listPullRequests(owner, repo, state, access_token);
  },
});

export const searchPullRequests = tool({
  name: "search_pull_requests",
  description: "Search pull requests by query",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.searchPullRequests(query, access_token);
  },
});

export const createPullRequest = tool({
  name: "create_pull_request",
  description: "Create a pull request",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    head: z.string(),
    base: z.string(),
    body: z.string().nullable().optional(),
  }),
  execute: async (args, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.createPullRequest(args, access_token);
  },
});

export const mergePullRequest = tool({
  name: "merge_pull_request",
  description: "Merge a pull request",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    commit_title: z.string().nullable().optional(),
    commit_message: z.string().nullable().optional(),
    merge_method: z.enum(["merge", "squash", "rebase"]).nullable().optional(),
  }),
  execute: async (
    { owner, repo, ...rest },
    ctx?: RunContext<TIntegrations>
  ) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.mergePullRequest(
      owner,
      repo,
      rest.pull_number,
      rest,
      access_token
    );
  },
});

// --- ISSUES ---

export const listIssues = tool({
  name: "list_issues",
  description: "List issues assigned to the user",
  parameters: z.object({
    filter: z
      .enum(["assigned", "created", "mentioned", "subscribed", "all"])
      .default("assigned"),
    state: z.enum(["open", "closed", "all"]).default("open"),
  }),
  execute: async ({ filter, state }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.listIssues(filter, state, access_token);
  },
});

export const searchIssues = tool({
  name: "search_issues",
  description: "Search issues by query",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.searchIssues(query, access_token);
  },
});

export const createIssue = tool({
  name: "create_issue",
  description: "Create a new issue",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    body: z.string().nullable().optional(),
  }),
  execute: async (args, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.createIssue(args, access_token);
  },
});

export const updateIssue = tool({
  name: "update_issue",
  description: "Update an issue's state or content",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
    title: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    state: z.enum(["open", "closed"]).nullable().optional(),
  }),
  execute: async (
    { owner, repo, issue_number, ...rest },
    ctx?: RunContext<TIntegrations>
  ) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.updateIssue(owner, repo, issue_number, rest, access_token);
  },
});

export const commentOnIssue = tool({
  name: "comment_on_issue",
  description: "Add a comment to an issue",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
    body: z.string().nullable(),
  }),
  execute: async (
    { owner, repo, issue_number, body },
    ctx?: RunContext<TIntegrations>
  ) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.commentOnIssue(owner, repo, issue_number, body, access_token);
  },
});

export const listIssueComments = tool({
  name: "list_issue_comments",
  description: "List comments on a GitHub issue",
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
  }),
  execute: async (
    { owner, repo, issue_number },
    ctx?: RunContext<TIntegrations>
  ) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.listIssueComments(owner, repo, issue_number, access_token);
  },
});

// --- NOTIFICATIONS ---

export const listNotifications = tool({
  name: "list_notifications",
  description: "List GitHub notifications",
  parameters: z.object({
    all: z.boolean().default(false),
    participating: z.boolean().default(false),
  }),
  execute: async ({ all, participating }, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.listNotifications(all, participating, access_token);
  },
});

export const markAllNotificationsRead = tool({
  name: "mark_all_notifications_read",
  description: "Mark all GitHub notifications as read",
  parameters: z.object({}),
  execute: async (_, ctx?: RunContext<TIntegrations>) => {
    const access_token = ctx?.context?.["github"].access_token;
    return githubAdapters.markAllNotificationsRead(access_token);
  },
});
