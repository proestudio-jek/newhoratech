export type Hymn = {
  id: string;
  title: string;
  musicUrl?: string;
};

export type CommunityVideo = {
  id: string;
  youtubeId: string;
  title: string;
  createdAt: string;
};

export type PlaylistItem = {
    id: string;
    title: string;
    createdAt: string;
};

export type NewsArticle = {
    id: string;
    title: string;
    content: string;
    date: string;
};
