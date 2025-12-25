import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useKeyboardStore } from '../../stores/keyboardStore';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';
import Button from '../common/Button';
import { shortTimeAgo } from '../../utils/helpers';

function MessagesColumn({ column }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const containerRef = useRef(null);
  const { registerColumnRef, unregisterColumnRef } = useKeyboardStore();

  // Register scroll container ref for keyboard navigation
  useEffect(() => {
    registerColumnRef(column.id, containerRef);
    return () => unregisterColumnRef(column.id);
  }, [column.id, registerColumnRef, unregisterColumnRef]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Fetch conversations error:', error);
    }
    setIsLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-refresh based on column settings (default: 60 seconds)
  useAutoRefresh(fetchConversations, column.refreshInterval ?? 60, true);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (selectedConvo) {
    return (
      <ConversationView
        conversation={selectedConvo}
        onBack={() => setSelectedConvo(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* New message button */}
      <div className="p-4 border-b border-border">
        <Button variant="primary" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Conversations list */}
      <div ref={containerRef} className="column-content">
        {conversations.map((convo) => {
          const otherMembers = convo.members?.filter(
            (m) => m.did !== convo.myDid
          ) || [];
          const displayMember = otherMembers[0];

          return (
            <button
              key={convo.id}
              onClick={() => setSelectedConvo(convo)}
              className="w-full px-4 py-3 border-b border-border flex items-start gap-3 hover:bg-bg-tertiary/50 transition-colors text-left"
            >
              <Avatar
                src={displayMember?.avatar}
                alt={displayMember?.displayName}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text-primary truncate">
                    {displayMember?.displayName || displayMember?.handle || 'Unknown'}
                  </span>
                  {convo.lastMessage?.sentAt && (
                    <span className="text-xs text-text-muted flex-shrink-0">
                      {shortTimeAgo(convo.lastMessage.sentAt)}
                    </span>
                  )}
                </div>
                {convo.lastMessage?.text && (
                  <p className="text-sm text-text-secondary truncate mt-0.5">
                    {convo.lastMessage.text}
                  </p>
                )}
                {convo.unreadCount > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                    {convo.unreadCount} new
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationView({ conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/messages/conversations/${conversation.id}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post(`/messages/conversations/${conversation.id}/messages`, {
        text: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary">
          ←
        </button>
        <span className="font-medium">Conversation</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id || index} className="flex flex-col">
              <div className="bg-bg-tertiary rounded-xl px-3 py-2 max-w-[80%]">
                <p className="text-text-primary">{msg.text}</p>
              </div>
              <span className="text-xs text-text-muted mt-1">
                {shortTimeAgo(msg.sentAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button variant="primary" onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default MessagesColumn;
