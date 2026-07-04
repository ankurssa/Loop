export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix' | 'archived';
export type FeedbackSource = 'slack' | 'figma' | 'manual';
export type Severity = 'blocking' | 'minor' | 'nice_to_have';

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  translatedDescription?: string;
  status: FeedbackStatus;
  source: FeedbackSource;
  project: string;
  author: string;
  createdAt: Date;
  lastUpdated: Date;
  resolvedAt?: Date;
  isTechnical: boolean;
  isDuplicate: boolean;
  duplicateOf?: string;
  severity: Severity;
  nudgeSent?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface DigestData {
  date: string;
  counts: {
    open: number;
    in_progress: number;
    resolved: number;
    wont_fix: number;
    archived: number;
  };
  newItems: FeedbackItem[];
  staleItems: FeedbackItem[];
}
