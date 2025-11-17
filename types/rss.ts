// types/rss.ts
export type Feed = {
    id: string;
    name: string;
    url: string;
};

export type RssItem = {
    id: string;
    feedId: string;
    title: string;
    link: string;
    summary?: string;
    pubDate?: string; // ISO
    isRead: boolean;
    isArchived: boolean;
};
