// server/utils/feedbackStore.ts
export type Feedback = {
  id: string;
  userId: string;
  middlemanId?: string;
  type: 'middleman' | 'app';
  rating?: number;
  comment: string;
  createdAt: string;
};
