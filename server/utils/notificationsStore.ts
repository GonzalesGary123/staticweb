export type Notification = {
  id: string;
  userId: string;
  listingId?: string;
  type: 'pending_review' | 'approved' | 'rejected' | 'sold';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};
