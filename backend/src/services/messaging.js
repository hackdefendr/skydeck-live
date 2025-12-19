import { BskyAgent } from '@atproto/api';
import { authService } from './auth.js';
import { emitNewMessage } from '../socket/index.js';
import config from '../config/index.js';

class MessagingService {
  // Create a chat-specific agent that connects to Bluesky's chat service
  async _getChatAgent(user) {
    // Chat requires connecting to Bluesky's official chat service
    const agent = new BskyAgent({ service: config.bluesky.chatService });

    try {
      await agent.resumeSession({
        accessJwt: user.accessJwt,
        refreshJwt: user.refreshJwt,
        did: user.did,
        handle: user.handle,
        active: true,
      });
      return agent;
    } catch (error) {
      console.error('Failed to create chat agent:', error);
      throw new Error('Chat service unavailable');
    }
  }

  // Get conversations list
  async getConversations(user, { limit = 50, cursor } = {}) {
    const agent = await this._getChatAgent(user);

    try {
      const response = await agent.api.chat.bsky.convo.listConvos({ limit, cursor });
      return {
        conversations: this.transformConversations(response.data.convos),
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  // Get single conversation
  async getConversation(user, convoId) {
    const agent = await this._getChatAgent(user);

    try {
      const response = await agent.api.chat.bsky.convo.getConvo({ convoId });
      return this.transformConversation(response.data.convo);
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getMessages(user, convoId, { limit = 50, cursor } = {}) {
    const agent = await this._getChatAgent(user);

    try {
      const response = await agent.api.chat.bsky.convo.getMessages({
        convoId,
        limit,
        cursor,
      });
      return {
        messages: this.transformMessages(response.data.messages),
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(user, convoId, text) {
    const agent = await this._getChatAgent(user);

    try {
      const response = await agent.api.chat.bsky.convo.sendMessage({
        convoId,
        message: { text },
      });

      const message = this.transformMessage(response.data);

      // Emit to recipient(s) via socket
      // This would require knowing the conversation members
      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete message
  async deleteMessage(user, convoId, messageId) {
    const agent = await this._getChatAgent(user);

    try {
      await agent.api.chat.bsky.convo.deleteMessageForSelf({
        convoId,
        messageId,
      });
      return { success: true };
    } catch (error) {
      console.error('Delete message error:', error);
      return { success: false, error: error.message };
    }
  }

  // Start new conversation
  async startConversation(user, memberDids) {
    const agent = await this._getChatAgent(user);

    try {
      const response = await agent.api.chat.bsky.convo.getConvoForMembers({
        members: memberDids,
      });
      return {
        success: true,
        conversation: this.transformConversation(response.data.convo),
      };
    } catch (error) {
      console.error('Start conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Leave conversation
  async leaveConversation(user, convoId) {
    const agent = await this._getChatAgent(user);

    try {
      await agent.api.chat.bsky.convo.leaveConvo({ convoId });
      return { success: true };
    } catch (error) {
      console.error('Leave conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mute conversation
  async muteConversation(user, convoId) {
    const agent = await this._getChatAgent(user);

    try {
      await agent.api.chat.bsky.convo.muteConvo({ convoId });
      return { success: true };
    } catch (error) {
      console.error('Mute conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unmute conversation
  async unmuteConversation(user, convoId) {
    const agent = await this._getChatAgent(user);

    try {
      await agent.api.chat.bsky.convo.unmuteConvo({ convoId });
      return { success: true };
    } catch (error) {
      console.error('Unmute conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark conversation as read
  async markAsRead(user, convoId, messageId) {
    const agent = await this._getChatAgent(user);

    try {
      await agent.api.chat.bsky.convo.updateRead({
        convoId,
        messageId,
      });
      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread count
  async getUnreadCount(user) {
    const agent = await this._getChatAgent(user);

    try {
      const response = await agent.api.chat.bsky.convo.listConvos({ limit: 100 });
      let unreadCount = 0;

      for (const convo of response.data.convos) {
        if (convo.unreadCount) {
          unreadCount += convo.unreadCount;
        }
      }

      return unreadCount;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Transform conversations for frontend
  transformConversations(conversations) {
    return conversations.map((convo) => this.transformConversation(convo));
  }

  transformConversation(convo) {
    return {
      id: convo.id,
      rev: convo.rev,
      members: convo.members?.map((member) => ({
        did: member.did,
        handle: member.handle,
        displayName: member.displayName,
        avatar: member.avatar,
      })) || [],
      lastMessage: convo.lastMessage ? this.transformMessage(convo.lastMessage) : null,
      unreadCount: convo.unreadCount || 0,
      muted: convo.muted || false,
    };
  }

  // Transform messages for frontend
  transformMessages(messages) {
    return messages.map((msg) => this.transformMessage(msg));
  }

  transformMessage(message) {
    return {
      id: message.id,
      rev: message.rev,
      text: message.text,
      sender: message.sender ? {
        did: message.sender.did,
      } : null,
      sentAt: message.sentAt,
      embed: message.embed,
    };
  }

  // Emit new message to user
  sendRealtimeMessage(userId, message) {
    emitNewMessage(userId, message);
  }
}

export const messagingService = new MessagingService();
export default messagingService;
