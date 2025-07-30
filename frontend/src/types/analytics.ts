// Analytics and metrics types
export interface ConversationMetrics {
  total_conversations: number;
  active_conversations: number;
  avg_response_time: number;
  satisfaction_score: number;
  resolution_rate: number;
}

export interface ChatbotAnalytics {
  chatbot_id: string;
  period: string;
  metrics: ConversationMetrics;
  trends: MetricTrend[];
}

export interface MetricTrend {
  date: string;
  value: number;
  metric: string;
}
