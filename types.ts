export interface FraudNews {
  title: string;
  summary: string;
  sourceUrl: string;
  date: string;
}

export interface GameRound {
  id: string;
  sender: string; // The mocked sender name or number (e.g., "+86 170...", "95588")
  content: string; // The message or call script
  type: 'sms' | 'call';
  isFraud: boolean;
  newsContext: string; // The news title it was based on
  explanation: string; // Why it is/isn't fraud
  estimatedLoss?: number; // Estimated financial loss in RMB if scammed
}

export interface IntelligenceRecord {
  id: string;
  news: FraudNews;
  mockups: GameRound[];
  timestamp: number;
}

export interface AppState {
  news: FraudNews[];
  collectedKeywords: string[];
  rounds: GameRound[];
  score: number;
  currentRoundIndex: number;
  intelligenceVault: IntelligenceRecord[];
}