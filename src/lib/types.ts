
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

export type CommunityVideo = {
  id: string;
  youtubeId: string;
  title: string;
  createdAt: string;
};

export type PlaylistItem = {
  id: string;
  title:string;
  createdAt: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  role: string;
  conjunto?: string;
  createdAt: any;
};
