import { BaseEntity } from './index';

// Conversation related types
export interface Conversation extends BaseEntity {
  session_id: string;
  chatbot_id: string;
  user_name?: string;
  user_email?: string;
  platform: string;
  status: 'active' | 'closed' | 'transferred';
}

export interface Message extends BaseEntity {
  conversation_id: string;
  content: string;
  sender_type: 'user' | 'assistant' | 'operator';
  sender_id?: string;
  metadata?: Record<string, unknown>;
}
