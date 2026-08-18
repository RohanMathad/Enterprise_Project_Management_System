import React, { useState, useEffect, useRef } from 'react';
import { Hash, Info, Search, Smile, Send, Bold, Italic, List, Code } from 'lucide-react';
import clsx from 'clsx';
import { ChatChannel, ChatMessage } from '../../types/global.types';
import { subscribeToMessages, sendMessage } from '../../services/firestore.service';
import { useAppSelector } from '../../store/hooks';
import styles from './ChatPage.module.scss';
import { ChatPageProps } from './ChatPage.types';

const MOCK_CHANNELS: ChatChannel[] = [
  { id: '1', name: 'general', description: 'General team updates' },
  { id: '2', name: 'design', description: 'Design discussion' },
  { id: '3', name: 'engineering', description: 'Engineering chat' }
];

export const ChatPage: React.FC<ChatPageProps> = () => {
  const [activeChannelId, setActiveChannelId] = useState('1');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const channels = MOCK_CHANNELS;
  const activeChannel = channels.find(c => c.id === activeChannelId);

  useEffect(() => {
    setMessages([]); // Clear messages when switching channels
    // Subscribe to messages for the active channel
    const unsubscribe = subscribeToMessages(activeChannelId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [activeChannelId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user) return;
    
    try {
      const newMsg = {
        channelId: activeChannelId,
        sender: user,
        content: messageInput.trim(),
      };
      setMessageInput('');
      await sendMessage(activeChannelId, newMsg);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.chatPage}>
      {/* Sidebar for Channels */}
      <div className={styles.chatSidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Workspace</h3>
          <button className={styles.iconBtn}><Code size={16} /></button>
        </div>
        
        <div className={styles.section}>
          <h4>Channels</h4>
          {channels.map(channel => (
            <div 
              key={channel.id} 
              className={clsx(styles.channelItem, channel.id === activeChannelId && styles.active)}
              onClick={() => setActiveChannelId(channel.id)}
            >
              <Hash size={16} />
              <span>{channel.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.chatMain}>
        <div className={styles.chatHeader}>
          <div className={styles.channelInfo}>
            <Hash size={20} className={styles.hashIcon} />
            <h2>{activeChannel?.name}</h2>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn}><Info size={20} /></button>
          </div>
        </div>

        <div className={styles.messageList}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>
              No messages in #{activeChannel?.name} yet. Say hi!
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.sender.id === user?.id;
              
              return (
                <div key={msg.id} className={clsx(styles.messageGroup, isSelf && styles.messageSelf)}>
                  {!isSelf && (
                    <img 
                      src={msg.sender.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender.firstName}`} 
                      alt={msg.sender.firstName} 
                      className={styles.avatar} 
                    />
                  )}
                  <div className={styles.messageContent}>
                    <div className={styles.messageMeta}>
                      {!isSelf && <span className={styles.author}>{msg.sender.firstName} {msg.sender.lastName}</span>}
                      <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                      {isSelf && <span className={styles.author}>You</span>}
                    </div>
                    <div className={clsx(styles.messageBubble, isSelf && styles.bubblePrimary)}>
                      {msg.content}
                    </div>
                  </div>
                  {isSelf && (
                    <img 
                      src={msg.sender.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender.firstName}`} 
                      alt="You" 
                      className={styles.avatar} 
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <div className={styles.formatToolbar}>
              <button onClick={() => setMessageInput(prev => prev + '**text**')}><Bold size={16} /></button>
              <button onClick={() => setMessageInput(prev => prev + '*text*')}><Italic size={16} /></button>
              <button onClick={() => setMessageInput(prev => prev + '\n- ')}><List size={16} /></button>
              <button onClick={() => setMessageInput(prev => prev + '`code`')}><Code size={16} /></button>
            </div>
            <textarea 
              placeholder={`Message #${activeChannel?.name}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className={styles.inputFooter}>
              <div className={styles.footerLeft}>
                <button onClick={() => setMessageInput(prev => prev + '😊')}><Smile size={20} /></button>
              </div>
              <button className={styles.sendBtn} onClick={handleSendMessage} disabled={!messageInput.trim()}>
                Send <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
