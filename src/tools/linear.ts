import { tool, RunContext } from "@openai/agents";
import { z } from "zod";
import { getLinearClient } from "../lib/misc";
import { TIntegrations } from "../../types/integrations";

export const listLinearIssues = tool({
  name: "list_linear_issues",
  description: "List Linear issues assigned to the user",
  parameters: z.object({
    status: z.string().optional().nullable(),
    teamId: z.string().optional().nullable(),
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
    description: z.string().optional().nullable(),
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

export const getMembers = tool({
  name: "get_linear_team_members",
  description: "Get all the members of a Linear team",
  parameters: z.object({
    teamId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.teamMemberships(args.teamId);
    return res.nodes.map((member) => member.user);
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

export const createLinearProject = tool({
  name: "create_linear_project",
  description: "Create a new project in Linear",
  parameters: z.object({
    name: z.string(),
    teamId: z.string(),
    description: z.string().optional().nullable(),
    memberIds: z.array(z.string()).optional().nullable(),
    teamMemberIds: z.array(z.string()).optional().nullable(),
    content: z.string().optional().nullable(),
    priority: z
      .number()
      .optional()
      .nullable()
      .describe(
        "Priority of the project on a scale of 0(No priority), 1(Urgent), 2(High), 3(Medium), 4(Low)"
      ),
    leadId: z
      .string()
      .optional()
      .nullable()
      .describe("Id of the lead of the project or 0"),
    statusId: z
      .string()
      .optional()
      .nullable()
      .describe(
        "Id of the status of the project. 1(Backlog), 2(Planned), 3(In Progress), 4(Completed), 5(Canceled)"
      ),
    labelIds: z.array(z.string()).optional().nullable(),
    startDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.createProject({
      name: args.name,
      teamIds: [args.teamId],
      description: args.description,
      memberIds: args.memberIds,
      content: args.content,
      priority: args.priority,
      leadId: args.leadId,
      labelIds: args.labelIds,
      startDate: args.startDate,
      targetDate: args.dueDate,
      statusId: args.statusId,
      color: args.color,
    });

    return res.project;
  },
});

export const getLinearStatuses = tool({
  name: "get_linear_statuses",
  description: "Get all the statuses in a Linear team",
  parameters: z.object({
    teamId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.customerStatuses();
    return res.nodes;
  },
});

export const getLinearStatusById = tool({
  name: "get_linear_status_by_id",
  description: "Get a Linear status by id",
  parameters: z.object({
    id: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );
    const res = await linear.customerStatus(args.id);
    return res;
  },
});

export const getLabels = tool({
  name: "get_linear_labels",
  description: "Get all the labels in a Linear team",
  parameters: z.object({
    teamId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );

    const res = await linear.issueLabels({
      filter: {
        team: { id: { eq: args.teamId } },
      },
    });
    return res.nodes;
  },
});

export const createLabel = tool({
  name: "create_linear_label",
  description: "Create a new label in a Linear team",
  parameters: z.object({
    teamId: z.string(),
    name: z.string(),
    color: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const linear = await getLinearClient(
      runContext?.context?.["linear"].access_token!
    );

    const res = await linear.createIssueLabel({
      teamId: args.teamId,
      name: args.name,
      color: args.color,
    });
    return {
      id: res.issueLabelId,
      name: res.issueLabel,
    };
  },
});
