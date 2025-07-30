import { BaseEntity } from './index';

// Chatbot related types
export interface Chatbot extends BaseEntity {
  name: string;
  description: string;
  company_id: string;
  is_active: boolean;
  configuration: ChatbotConfiguration;
}

export interface ChatbotConfiguration {
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  welcome_message: string;
}
