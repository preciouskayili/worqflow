import { makeSlackRequest } from "../../lib/misc";

export const listSlackChannels = async (access_token: string) => {
  const channels = await makeSlackRequest(
    access_token,
    "conversations.list",
    "GET",
    undefined
  );
  return channels.channels;
};

export const getChannelInfo = async (
  channelId: string,
  access_token: string
) => {
  const channel = await makeSlackRequest(
    access_token,
    "conversations.info",
    "GET",
    { channel: channelId }
  );
  return channel;
};

export const getUserInfo = async (userId: string, access_token: string) => {
  const user = await makeSlackRequest(access_token, "users.info", "GET", {
    user: userId,
  });
  return user;
};

export const getChannelMessages = async (
  channelId: string,
  access_token: string
) => {
  const messages = await makeSlackRequest(
    access_token,
    "conversations.history",
    "GET",
    { channel: channelId }
  );
  return messages.messages;
};

export const sendMessage = async (
  channelId: string,
  message: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "chat.postMessage",
    "POST",
    { channel: channelId, text: message }
  );
  return response.message.text;
};

export const scheduleMessage = async (
  channelId: string,
  message: string,
  scheduledTime: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "chat.scheduleMessage",
    "POST",
    {
      channel: channelId,
      text: message,
      scheduled_time: scheduledTime,
    }
  );
  return response.message.text;
};

export const deleteScheduledMessage = async (
  scheduledMessageId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "chat.deleteScheduledMessage",
    "POST",
    { scheduled_message_id: scheduledMessageId }
  );
  return response.message.text;
};

export const updateScheduledMessage = async (
  scheduledMessageId: string,
  message: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "chat.updateScheduledMessage",
    "POST",
    { scheduled_message_id: scheduledMessageId, text: message }
  );
  return response.message.text;
};

export const getScheduledMessages = async (
  channelId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "chat.getScheduledMessages",
    "GET",
    { channel: channelId }
  );
  return response.messages;
};

export const deleteMessage = async (
  channelId: string,
  messageId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(access_token, "chat.delete", "POST", {
    channel: channelId,
    ts: messageId,
  });
  return response.message.text;
};

export const sendEphemeralMessage = async (
  userId: string,
  channelId: string,
  message: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "chat.postEphemeral",
    "POST",
    { channel: channelId, text: message, user: userId }
  );
  return response.message.text;
};

export const updateMessage = async (
  channelId: string,
  messageId: string,
  message: string,
  access_token: string
) => {
  const response = await makeSlackRequest(access_token, "chat.update", "POST", {
    channel: channelId,
    ts: messageId,
    text: message,
  });
  return response.message.text;
};

export const getPresence = async (userId: string, access_token: string) => {
  const response = await makeSlackRequest(
    access_token,
    "users.getPresence",
    "GET",
    { user: userId }
  );
  return response.presence;
};

export const setStatus = async (
  status: "auto" | "away",
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "users.setPresence",
    "POST",
    { presence: status }
  );
  return response.message.text;
};

export const kickFromChannel = async (
  channelId: string,
  userId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.kick",
    "POST",
    { channel: channelId, user: userId }
  );
  return response.message.text;
};

export const joinChannel = async (channelId: string, access_token: string) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.join",
    "POST",
    { channel: channelId }
  );
  return response.message.text;
};

export const leaveChannel = async (channelId: string, access_token: string) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.leave",
    "POST",
    { channel: channelId }
  );
  return response.message.text;
};

export const inviteToChannel = async (
  channelId: string,
  userId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.invite",
    "POST",
    { channel: channelId, users: userId }
  );
  return response.message.text;
};

export const addReaction = async (
  channelId: string,
  messageId: string,
  reaction: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "reactions.add",
    "POST",
    {
      channel: channelId,
      timestamp: messageId,
      name: reaction,
    }
  );
  return response.message.text;
};

export const removeReaction = async (
  channelId: string,
  messageId: string,
  reaction: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "reactions.remove",
    "POST",
    {
      channel: channelId,
      timestamp: messageId,
      name: reaction,
    }
  );
  return response.message.text;
};

export const unpinMessage = async (
  channelId: string,
  messageId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(access_token, "pins.remove", "POST", {
    channel: channelId,
    timestamp: messageId,
  });
  return response.message.text;
};

export const pinMessage = async (
  channelId: string,
  messageId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(access_token, "pins.add", "POST", {
    channel: channelId,
    timestamp: messageId,
  });
  return response.message.text;
};

export const uploadFile = async (
  channelId: string,
  file: File,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "files.upload",
    "POST",
    { channel: channelId, file: file }
  );
  return response.message.text;
};

export const getUnreadMessages = async (access_token: string) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.list",
    "GET",
    { exclude_archived: true }
  );
  const channels = response.channels;
  const unreadMessages: any[] = [];
  for (const channel of channels) {
    const channelInfo = await makeSlackRequest(
      access_token,
      "conversations.info",
      "GET",
      { channel: channel.id }
    );
    const unreadCount = channelInfo.channel.unread_count_display;
    if (unreadCount === 0) continue;
    const history = await makeSlackRequest(
      access_token,
      "conversations.history",
      "GET",
      { channel: channel.id, limit: unreadCount }
    );
    unreadMessages.push(
      ...history.messages.map((message: any) => ({
        channel: channel.name,
        time: message.ts,
        text: message.text,
      }))
    );
  }
  return unreadMessages;
};

export const archiveChannel = async (
  channelId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.archive",
    "POST",
    { channel: channelId }
  );

  return response.message.text;
};

export const unarchiveChannel = async (
  channelId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.unarchive",
    "POST",
    { channel: channelId }
  );
  return response.message.text;
};

export const getChannelMembers = async (
  channelId: string,
  access_token: string
) => {
  const response = await makeSlackRequest(
    access_token,
    "conversations.members",
    "GET",
    { channel: channelId }
  );

  return response.members;
};
