
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
};

export type CommunityVideo = {
  id: string;
  youtubeId: string;
  title: string;
  createdAt: any;
};

export type PlaylistItem = {
  id: string;
  title:string;
  createdAt: any;
};

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  date: any;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  role: string;
  conjunto?: string;
  createdAt: any;
};
