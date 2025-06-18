import { Agent } from "@openai/agents";
import {
  listEmails,
  getEmail,
  sendEmail,
  replyToEmail,
  searchEmails,
  getLabels,
  createLabel,
  modifyEmailLabels,
  markAsRead,
  markAsUnread,
  trashEmail,
  untrashEmail,
} from "../tools/gmailTools";
import { GMAIL_AGENT_PROMPT } from "../lib/prompts";

export const gmailAgent = new Agent({
  name: "gmail_agent",
  instructions: GMAIL_AGENT_PROMPT,
  tools: [
    listEmails,
    getEmail,
    sendEmail,
    replyToEmail,
    searchEmails,
    getLabels,
    createLabel,
    modifyEmailLabels,
    markAsRead,
    markAsUnread,
    trashEmail,
    untrashEmail,
  ],
});
