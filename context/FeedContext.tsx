import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { Alert } from "react-native";
import { XMLParser } from "fast-xml-parser";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FeedItem = {
    id: string;
    title: string;
    link: string;
    pubDate?: string;
    description?: string;
    archived: boolean;
    read: boolean;
};

export type FeedSource = {
    id: string;
    name: string;
    url: string;
    createdAt: string;
};

export type HomeViewMode = "single" | "all";

type ItemMeta = {
    archived: boolean;
    read: boolean;
};

type MetaStore = {
    [sourceId: string]: {
        [itemId: string]: ItemMeta;
    };
};

type FeedStore = {
    sources: FeedSource[];
    selectedId?: string;
    refreshMinutes: number;
    homeViewMode?: HomeViewMode;
    meta?: MetaStore; // 👈 okundu / arşiv kalıcı meta
};

type FeedContextValue = {
    sources: FeedSource[];
    selectedSource?: FeedSource;
    items: FeedItem[];
    loading: boolean;
    error?: string;
    refreshMinutes: number;
    homeViewMode: HomeViewMode;

    setRefreshMinutes: (min: number) => void;
    setHomeViewMode: (mode: HomeViewMode) => void;

    addFeedSource: (name: string, url: string) => Promise<boolean>;
    removeFeedSource: (id: string) => void;
    selectSource: (id: string) => void;

    toggleArchive: (id: string) => void;
    toggleRead: (id: string) => void;

    refreshFeeds: () => Promise<void>; // 🔥 yeni

};

const FeedContext = createContext<FeedContextValue | undefined>(
    undefined
);

const STORAGE_KEY = "rssReaderApp:feedStore";

export const FeedProvider = ({ children }: { children: ReactNode }) => {
    const [sources, setSources] = useState<FeedSource[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>(
        undefined
    );
    const [refreshMinutes, _setRefreshMinutes] =
        useState<number>(15);
    const [homeViewMode, _setHomeViewMode] =
        useState<HomeViewMode>("all");

    const [meta, setMeta] = useState<MetaStore>({});
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(
        undefined
    );

    // ---------- Store yükle ----------
    useEffect(() => {
        const loadStore = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) return;

                const parsed: FeedStore = JSON.parse(raw);
                setSources(parsed.sources ?? []);
                setSelectedId(parsed.selectedId);
                _setRefreshMinutes(parsed.refreshMinutes ?? 15);
                _setHomeViewMode(parsed.homeViewMode ?? "all");
                setMeta(parsed.meta ?? {});
            } catch (err) {
                console.error("Store load error:", err);
            }
        };

        loadStore();
    }, []);

    // ---------- Store kaydet ----------
    useEffect(() => {
        const saveStore = async () => {
            try {
                const store: FeedStore = {
                    sources,
                    selectedId,
                    refreshMinutes,
                    homeViewMode,
                    meta,
                };
                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(store)
                );
            } catch (err) {
                console.error("Store save error:", err);
            }
        };

        saveStore();
    }, [sources, selectedId, refreshMinutes, homeViewMode, meta]);

    const selectedSource = sources.find(
        (s) => s.id === selectedId
    );

    // ---------- RSS çekme (kalıcı meta ile birleştir) ----------
    const loadFeedForSource = async (
        source: FeedSource,
        opts?: { silent?: boolean }
    ): Promise<boolean> => {
        const silent = opts?.silent ?? false;

        try {
            new URL(source.url);
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
            const res = await fetch(source.url);
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

            const sourceMeta = meta[source.id] ?? {};

            const nextItems: FeedItem[] = arr.map(
                (item: any, index: number) => {
                    const id =
                        item.guid?.["#text"] ??
                        item.guid ??
                        item.id ??
                        `${index}`;

                    const m = sourceMeta[id] ?? {
                        archived: false,
                        read: false,
                    };

                    return {
                        id,
                        title:
                            item.title?.["#text"] ??
                            item.title ??
                            "Başlıksız",
                        link:
                            item.link?.href ??
                            (typeof item.link === "string"
                                ? item.link
                                : "") ??
                            "",
                        pubDate:
                            item.pubDate ?? item.updated ?? item.published,
                        description:
                            item.description?.["#text"] ??
                            item.description ??
                            item.summary ??
                            "",
                        archived: m.archived,
                        read: m.read,
                    };
                }
            );

            setItems(nextItems);

            return true;
        } catch (err: any) {
            console.error("RSS fetch error", err);
            const msg =
                err?.message ?? "RSS okunurken bir hata oluştu.";
            setError(msg);
            if (!silent) Alert.alert("Hata", msg);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // ---------- Feed ekleme ----------
    const addFeedSource = async (
        name: string,
        url: string
    ): Promise<boolean> => {
        const trimmedUrl = url.trim();
        const trimmedName = name.trim() || "Yeni Kaynak";

        try {
            new URL(trimmedUrl);
        } catch {
            Alert.alert("Hata", "Geçerli bir URL gir.");
            return false;
        }

        const id = Date.now().toString();

        const source: FeedSource = {
            id,
            name: trimmedName,
            url: trimmedUrl,
            createdAt: new Date().toISOString(),
        };

        setSources((prev) => [...prev, source]);
        setSelectedId(id);
        setItems([]);

        const ok = await loadFeedForSource(source, {
            silent: false,
        });

        return ok;
    };

    // ---------- Feed silme (meta ile birlikte) ----------
    const removeFeedSource = (id: string) => {
        setSources((prev) => prev.filter((s) => s.id !== id));
        setMeta((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        if (selectedId === id) {
            const remaining = sources.filter((s) => s.id !== id);
            const nextSource = remaining[0];
            if (nextSource) {
                setSelectedId(nextSource.id);
                setItems([]);
                loadFeedForSource(nextSource, { silent: false }).catch(
                    () => { }
                );
            } else {
                setSelectedId(undefined);
                setItems([]);
            }
        }
    };

    // ---------- Feed seçme ----------
    const selectSource = (id: string) => {
        if (id === selectedId) return;
        const found = sources.find((s) => s.id === id);
        if (!found) return;
        setSelectedId(id);
        setItems([]);
        loadFeedForSource(found, { silent: false }).catch(() => { });
    };

    // ---------- Okundu / Arşiv (kalıcı meta + items) ----------
    const updateMetaForCurrentSource = (
        itemId: string,
        updater: (m: ItemMeta) => ItemMeta
    ) => {
        if (!selectedSource) return;
        setMeta((prev) => {
            const srcMeta = { ...(prev[selectedSource.id] ?? {}) };
            const current = srcMeta[itemId] ?? {
                archived: false,
                read: false,
            };
            srcMeta[itemId] = updater(current);
            return { ...prev, [selectedSource.id]: srcMeta };
        });
    };

    const toggleArchive = (id: string) => {
        // items içindeki state
        setItems((prev) =>
            prev.map((it) =>
                it.id === id ? { ...it, archived: !it.archived } : it
            )
        );

        // kalıcı meta
        updateMetaForCurrentSource(id, (m) => ({
            ...m,
            archived: !m.archived,
        }));
    };

    const toggleRead = (id: string) => {
        setItems((prev) =>
            prev.map((it) =>
                it.id === id ? { ...it, read: !it.read } : it
            )
        );

        updateMetaForCurrentSource(id, (m) => ({
            ...m,
            read: !m.read,
        }));
    };

    // ---------- Yenileme süresi + otomatik refresh ----------
    const setRefreshMinutes = (min: number) => {
        const safe = Math.min(120, Math.max(1, Math.round(min || 1)));
        _setRefreshMinutes(safe);
    };

    const setHomeViewMode = (mode: HomeViewMode) => {
        _setHomeViewMode(mode);
    };

    useEffect(() => {
        if (!selectedSource) return;

        const ms = refreshMinutes * 60 * 1000;
        const id = setInterval(() => {
            loadFeedForSource(selectedSource, {
                silent: true,
            }).catch(() => { });
        }, ms);

        return () => clearInterval(id);
    }, [selectedSource, refreshMinutes]);

    useEffect(() => {
        if (selectedSource && items.length === 0) {
            loadFeedForSource(selectedSource, {
                silent: false,
            }).catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSource?.id]);

    return (
        <FeedContext.Provider
            value={{
                sources,
                selectedSource,
                items,
                loading,
                error,
                refreshMinutes,
                homeViewMode,
                setRefreshMinutes,
                setHomeViewMode,
                addFeedSource,
                removeFeedSource,
                selectSource,
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
        throw new Error(
            "useFeed must be used within FeedProvider"
        );
    }
    return ctx;
};
