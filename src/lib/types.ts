
export type Hymn = {
  id: string;
  title: string;
  musicUrl?: string;
};

export type SolistaHymn = {
  id: string;
  title: string;
  lyrics?: string;
  solistaId: string;
  solistaName: string;
  conjunto: string;
  createdAt: any;
};

export type CalendarEntry = {
  id: string;
  date: any;
  hymnId: string;
  hymnTitle: string;
  musicUrl?: string;
  conjunto?: string;
  createdAt: any;
};

export type CommunityVideo = {
  id: string;
  youtubeId: string;
  title: string;
  conjunto: string;
  createdAt: any;
};

export type PlaylistItem = {
  id: string;
  title: string;
  conjunto: string;
  createdAt: any;
};

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  conjunto: string;
  date: any;
};

export type UserProfile = {
  id: string;
  username?: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'pending' | 'approved' | 'rejected';
  conjunto?: string;
  createdAt: any;
};
