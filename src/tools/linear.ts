import { tool, RunContext } from "@openai/agents";
import { z } from "zod";
import { getLinearClient } from "../lib/misc";
import { TIntegrations } from "../../types/integrations";

export const listLinearIssues = tool({
  name: "list_linear_issues",
  description: "List Linear issues assigned to the user",
  parameters: z.object({
    status: z.string().optional(),
    teamId: z.string().optional(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issues({
      filter: {
        assignee: { isMe: { eq: true } },
        state: args.status ? { name: { eq: args.status } } : undefined,
        team: args.teamId ? { id: { eq: args.teamId } } : undefined,
      },
    });
    return res.nodes;
  },
});

export const createLinearIssue = tool({
  name: "create_linear_issue",
  description: "Create a new issue in Linear",
  parameters: z.object({
    teamId: z.string(),
    title: z.string(),
    description: z.string().optional(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.createIssue({
      teamId: args.teamId,
      title: args.title,
      description: args.description,
    });
    return res.issue;
  },
});

export const commentOnLinearIssue = tool({
  name: "comment_on_linear_issue",
  description: "Comment on a Linear issue",
  parameters: z.object({
    issueId: z.string(),
    body: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.createComment({
      issueId: args.issueId,
      body: args.body,
    });
    return res.comment;
  },
});

export const getLinearUserByName = tool({
  name: "get_linear_user_by_name",
  description: "Get a Linear user by name",
  parameters: z.object({
    name: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.users({
      first: 1,
      filter: {
        name: { eq: args.name },
      },
    });
    return res.nodes[0];
  },
});

export const getLinearUserByEmail = tool({
  name: "get_linear_user_by_email",
  description: "Get a Linear user by email",
  parameters: z.object({
    email: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.users({
      first: 1,
      filter: {
        email: { eq: args.email },
      },
    });
    return res.nodes[0];
  },
});

export const getLinearUserIssues = tool({
  name: "get_linear_user_issues",
  description: "Get all the issues assigned to a Linear user",
  parameters: z.object({
    userName: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issues({
      filter: { assignee: { name: { eq: args.userName } } },
    });
    return res.nodes;
  },
});

export const getLinearIssueByTitle = tool({
  name: "get_linear_issue_by_title",
  description: "Get a Linear issue by title",
  parameters: z.object({
    title: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issues({
      filter: { title: { eq: args.title } },
    });
    return res.nodes;
  },
});

export const getLinearTeamByName = tool({
  name: "get_linear_team_by_name",
  description: "Get a Linear team by name",
  parameters: z.object({
    name: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.teams({
      first: 1,
      filter: { name: { eq: args.name } },
    });
    return res.nodes[0];
  },
});

export const getLinearTeamById = tool({
  name: "get_linear_team_by_id",
  description: "Get a Linear team by id",
  parameters: z.object({
    id: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.team(args.id);
    return res;
  },
});

export const listLinearTeams = tool({
  name: "list_linear_teams",
  description: "List all Linear teams",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.teams();
    return res.nodes;
  },
});

export const updateLinearIssueStatus = tool({
  name: "update_linear_issue_status",
  description: "Update the status of a Linear issue",
  parameters: z.object({
    issueId: z.string(),
    stateId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.updateIssue(args.issueId, {
      stateId: args.stateId,
    });
    return res.issue;
  },
});

export const getTodoIssuesByTeamId = tool({
  name: "get_todo_issues_by_team_id",
  description: "Get all the todo issues by team id",
  parameters: z.object({
    teamId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issues({
      filter: {
        team: { id: { eq: args.teamId } },
        state: { name: { eq: "Todo" } },
      },
    });
    return res.nodes;
  },
});

export const getUnassignedIssuesByTeamId = tool({
  name: "get_unassigned_issues_by_team_id",
  description: "Get all the unassigned issues by team id",
  parameters: z.object({
    teamId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issues({
      filter: {
        team: { id: { eq: args.teamId } },
        assignee: { isMe: { eq: false } },
      },
    });
    return res.nodes;
  },
});

export const getLinearIssue = tool({
  name: "get_linear_issue",
  description: "Get a Linear issue",
  parameters: z.object({
    issueId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issue(args.issueId);
    return res;
  },
});

export const getAssignedLinearIssues = tool({
  name: "get_assigned_linear_issues",
  description: "Get all Linear issues assigned to the user",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.issues({
      filter: {
        assignee: { isMe: { eq: true } },
      },
    });
    return res.nodes;
  },
});

export const assignLinearIssue = tool({
  name: "assign_linear_issue",
  description: "Assign a Linear issue to a teammate",
  parameters: z.object({
    issueId: z.string(),
    assigneeId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.updateIssue(args.issueId, {
      assigneeId: args.assigneeId,
    });
    return res.issue;
  },
});
