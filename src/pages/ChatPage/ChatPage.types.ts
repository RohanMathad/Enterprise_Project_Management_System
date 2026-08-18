import { ChatChannel, ChatMessage } from '../../types/global.types';

export interface ChatPageProps {}

export interface ChannelItemProps {
  channel: ChatChannel;
  isActive: boolean;
  unreadCount?: number;
}
