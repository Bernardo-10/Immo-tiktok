export type NotificationCategory = 'like' | 'save' | 'visitor' | 'favorite' | 'tier' | 'system';

export interface NotificationActor {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface NotificationListingRef {
  id: string;
  title: string;
  coverPhoto?: string;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  message: string;
  isRead: boolean;
  groupedVisitCount?: number | null;
  createdAt: string;
  actor?: NotificationActor | null;
  listing?: NotificationListingRef | null;
}
