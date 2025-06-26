import { tool, RunContext } from "@openai/agents";
import { z } from "zod";
import { getLinearClient } from "../lib/misc";
import { UserInfo } from "../../types/user";

export const listLinearIssues = tool({
  name: "list_linear_issues",
  description: "List Linear issues assigned to the user",
  parameters: z.object({
    status: z.string().optional(),
    teamId: z.string().optional(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const linear = await getLinearClient(
      runContext?.context.userId.toString()!
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const linear = await getLinearClient(
      runContext?.context.userId.toString()!
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const linear = await getLinearClient(
      runContext?.context.userId.toString()!
    );
    const res = await linear.createComment({
      issueId: args.issueId,
      body: args.body,
    });
    return res.comment;
  },
});

export const updateLinearIssueStatus = tool({
  name: "update_linear_issue_status",
  description: "Update the status of a Linear issue",
  parameters: z.object({
    issueId: z.string(),
    stateId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const linear = await getLinearClient(
      runContext?.context.userId.toString()!
    );
    const res = await linear.updateIssue(args.issueId, {
      stateId: args.stateId,
    });
    return res.issue;
  },
});

export const assignLinearIssue = tool({
  name: "assign_linear_issue",
  description: "Assign a Linear issue to a teammate",
  parameters: z.object({
    issueId: z.string(),
    assigneeId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const linear = await getLinearClient(
      runContext?.context.userId.toString()!
    );
    const res = await linear.updateIssue(args.issueId, {
      assigneeId: args.assigneeId,
    });
    return res.issue;
  },
});
