import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { Alert } from "react-native";
import { XMLParser } from "fast-xml-parser";

export type FeedItem = {
    id: string;
    title: string;
    link: string;
    pubDate?: string;
    description?: string;
    archived: boolean;
    read: boolean;
};

type FeedState = {
    url?: string;
    title?: string;
    items: FeedItem[];
};

type FeedContextValue = {
    feed: FeedState;
    loading: boolean;
    error?: string;
    refreshMinutes: number;
    setRefreshMinutes: (min: number) => void;
    addOrLoadFeed: (url: string) => Promise<boolean>;
    toggleArchive: (id: string) => void;
    toggleRead: (id: string) => void;
};

const FeedContext = createContext<FeedContextValue | undefined>(
    undefined
);

export const FeedProvider = ({ children }: { children: ReactNode }) => {
    const [feed, setFeed] = useState<FeedState>({ items: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    // Otomatik yenileme süresi (dakika)
    const [refreshMinutes, _setRefreshMinutes] = useState<number>(15);

    const setRefreshMinutes = (min: number) => {
        // 1–120 dk arası clamp
        const safe = Math.min(120, Math.max(1, Math.round(min || 1)));
        _setRefreshMinutes(safe);
    };

    // RSS çekme işini ortak fonksiyona aldık
    const loadFeedFromUrl = async (
        url: string,
        opts?: { silent?: boolean }
    ): Promise<boolean> => {
        const silent = opts?.silent ?? false;

        // Basit URL validasyonu
        try {
            new URL(url);
        } catch {
            const msg = "Geçerli bir URL gir.";
            setError(msg);
            if (!silent) Alert.alert("Hata", msg);
            return false;
        }

        if (!silent) {
            setLoading(true);
            setError(undefined);
        }

        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP hata kodu: ${res.status}`);
            }

            const text = await res.text();

            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: "",
            });

            const data = parser.parse(text);

            const channel = data.rss?.channel ?? data.channel ?? data.feed;
            if (!channel) {
                throw new Error("Beklenmeyen RSS formatı.");
            }

            const rawItems = channel.item ?? channel.entry ?? [];
            const arr = Array.isArray(rawItems) ? rawItems : [rawItems];

            // Önceki item'ları mapleyelim ki arşiv/okundu bilgisi kaybolmasın
            const prevMap = new Map<string, FeedItem>();
            for (const it of feed.items) {
                prevMap.set(it.id, it);
            }

            const items: FeedItem[] = arr.map((item: any, index: number) => {
                const id =
                    item.guid?.["#text"] ??
                    item.guid ??
                    item.id ??
                    `${index}`;
                const prev = prevMap.get(id);

                return {
                    id,
                    title:
                        item.title?.["#text"] ??
                        item.title ??
                        "Başlıksız",
                    link:
                        item.link?.href ??
                        (typeof item.link === "string" ? item.link : "") ??
                        "",
                    pubDate: item.pubDate ?? item.updated ?? item.published,
                    description:
                        item.description?.["#text"] ??
                        item.description ??
                        item.summary ??
                        "",
                    archived: prev?.archived ?? false,
                    read: prev?.read ?? false,
                };
            });

            setFeed({
                url,
                title: channel.title?.["#text"] ?? channel.title ?? url,
                items,
            });

            return true;
        } catch (err: any) {
            console.error("RSS fetch error", err);
            const msg = err?.message ?? "RSS okunurken bir hata oluştu.";
            setError(msg);
            if (!silent) Alert.alert("Hata", msg);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const addOrLoadFeed = async (url: string): Promise<boolean> => {
        return loadFeedFromUrl(url, { silent: false });
    };

    const toggleArchive = (id: string) => {
        setFeed((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === id ? { ...item, archived: !item.archived } : item
            ),
        }));
    };

    const toggleRead = (id: string) => {
        setFeed((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === id ? { ...item, read: !item.read } : item
            ),
        }));
    };

    // Otomatik yenileme (dakika ayarına göre)
    useEffect(() => {
        if (!feed.url) return;

        const ms = refreshMinutes * 60 * 1000;
        const id = setInterval(() => {
            // Sessiz yenileme (Alert patlatmasın)
            loadFeedFromUrl(feed.url!, { silent: true }).catch(() => { });
        }, ms);

        return () => clearInterval(id);
        // feed.url veya refreshMinutes değişince timer yenilensin
    }, [feed.url, refreshMinutes]);

    return (
        <FeedContext.Provider
            value={{
                feed,
                loading,
                error,
                refreshMinutes,
                setRefreshMinutes,
                addOrLoadFeed,
                toggleArchive,
                toggleRead,
            }}
        >
            {children}
        </FeedContext.Provider>
    );
};

export const useFeed = () => {
    const ctx = useContext(FeedContext);
    if (!ctx) {
        throw new Error("useFeed must be used within FeedProvider");
    }
    return ctx;
};
