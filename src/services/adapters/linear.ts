import { getLinearClient } from "../../lib/misc";

export const listLinearIssues = async (
  args: { status?: string | null; teamId?: string | null },
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issues({
    filter: {
      assignee: { isMe: { eq: true } },
      state: args.status ? { name: { eq: args.status } } : undefined,
      team: args.teamId ? { id: { eq: args.teamId } } : undefined,
    },
  });
  return res.nodes;
};

export const createLinearIssue = async (
  args: {
    teamId: string;
    title: string;
    description?: string | null;
  },
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.createIssue({
    teamId: args.teamId,
    title: args.title,
    description: args.description,
  });
  return res.issue;
};

export const commentOnLinearIssue = async (
  args: { issueId: string; body: string },
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.createComment({
    issueId: args.issueId,
    body: args.body,
  });
  return res.comment;
};

export const getLinearUserByName = async (
  name: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.users({
    first: 1,
    filter: {
      name: { eq: name },
    },
  });
  return res.nodes[0];
};

export const getLinearUserByEmail = async (
  email: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.users({
    first: 1,
    filter: {
      email: { eq: email },
    },
  });
  return res.nodes[0];
};

export const getMembers = async (teamId: string, access_token: string) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.teamMemberships(teamId);
  return res.nodes.map((member) => member.user);
};

export const getLinearUserIssues = async (
  userName: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issues({
    filter: { assignee: { name: { eq: userName } } },
  });
  return res.nodes;
};

export const getLinearIssueByTitle = async (
  title: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issues({
    filter: { title: { eq: title } },
  });
  return res.nodes;
};

export const getLinearTeamByName = async (
  name: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.teams({
    first: 1,
    filter: { name: { eq: name } },
  });
  return res.nodes[0];
};

export const getLinearTeamById = async (id: string, access_token: string) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.team(id);
  return res;
};

export const listLinearTeams = async (access_token: string) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.teams();
  return res.nodes;
};

export const updateLinearIssueStatus = async (
  issueId: string,
  stateId: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.updateIssue(issueId, {
    stateId: stateId,
  });
  return res.issue;
};

export const getTodoIssuesByTeamId = async (
  teamId: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issues({
    filter: {
      team: { id: { eq: teamId } },
      state: { name: { eq: "Todo" } },
    },
  });
  return res.nodes;
};

export const getUnassignedIssuesByTeamId = async (
  teamId: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issues({
    filter: {
      team: { id: { eq: teamId } },
      assignee: { isMe: { eq: false } },
    },
  });
  return res.nodes;
};

export const getLinearIssue = async (issueId: string, access_token: string) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issue(issueId);
  return res;
};

export const getAssignedLinearIssues = async (access_token: string) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issues({
    filter: {
      assignee: { isMe: { eq: true } },
    },
  });
  return res.nodes;
};

export const assignLinearIssue = async (
  issueId: string,
  assigneeId: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.updateIssue(issueId, {
    assigneeId: assigneeId,
  });
  return res.issue;
};

export const createLinearProject = async (
  args: {
    name: string;
    teamId: string;
    description?: string | null;
    memberIds?: string[] | null;
    teamMemberIds?: string[] | null;
    content?: string | null;
    priority?: number | null;
    leadId?: string | null;
    statusId?: string | null;
    labelIds?: string[] | null;
    startDate?: string | null;
    dueDate?: string | null;
    color?: string | null;
  },
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
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
};

export const getLinearStatuses = async (
  teamId: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.customerStatuses();
  return res.nodes;
};

export const getLinearStatusById = async (
  id: string,
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.customerStatus(id);
  return res;
};

export const getLabels = async (teamId: string, access_token: string) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.issueLabels({
    filter: {
      team: { id: { eq: teamId } },
    },
  });
  return res.nodes;
};

export const createLabel = async (
  args: { teamId: string; name: string; color: string },
  access_token: string
) => {
  const linear = await getLinearClient(access_token);
  const res = await linear.createIssueLabel({
    teamId: args.teamId,
    name: args.name,
    color: args.color,
  });
  return {
    id: res.issueLabelId,
    name: res.issueLabel,
  };
};

