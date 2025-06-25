import { Agent } from "@openai/agents";
import * as gmailTools from "../tools/google/gmail";
import { GMAIL_AGENT_PROMPT } from "../lib/prompts";

const {
  listEmails,
  getThreadById,
  replyToEmail,
  searchEmails,
  getLabels,
  createLabel,
  modifyEmailLabels,
  markAsRead,
  markAsUnread,
  trashEmail,
  untrashEmail,
  listThreads,
  sendEmail,
  createDraft,
  listLabels,
  addLabelToEmail,
  archiveEmail,
  readEmail,
  getEmailById,
  listEmailsByDate,
} = gmailTools;

export const gmailAgent = new Agent({
  name: "gmail_agent",
  instructions: GMAIL_AGENT_PROMPT,
  tools: [
    listEmails,
    getThreadById,
    replyToEmail,
    searchEmails,
    getLabels,
    createLabel,
    modifyEmailLabels,
    markAsRead,
    markAsUnread,
    trashEmail,
    untrashEmail,
    listThreads,
    sendEmail,
    createDraft,
    listLabels,
    addLabelToEmail,
    archiveEmail,
    readEmail,
    getEmailById,
    listEmailsByDate,
  ],
});
