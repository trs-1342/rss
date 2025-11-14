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

type FeedStore = {
    sources: FeedSource[];
    selectedId?: string;
    refreshMinutes: number;
};

type FeedContextValue = {
    sources: FeedSource[];
    selectedSource?: FeedSource;
    items: FeedItem[];
    loading: boolean;
    error?: string;
    refreshMinutes: number;

    setRefreshMinutes: (min: number) => void;

    addFeedSource: (name: string, url: string) => Promise<boolean>;
    removeFeedSource: (id: string) => void;
    selectSource: (id: string) => void;

    toggleArchive: (id: string) => void;
    toggleRead: (id: string) => void;
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

    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(
        undefined
    );

    // ---------- Local "DB": AsyncStorage'tan yükle ----------
    useEffect(() => {
        const loadStore = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) return;

                const parsed: FeedStore = JSON.parse(raw);
                setSources(parsed.sources ?? []);
                setSelectedId(parsed.selectedId);
                _setRefreshMinutes(parsed.refreshMinutes ?? 15);
            } catch (err) {
                console.error("Store load error:", err);
            }
        };

        loadStore();
    }, []);

    // ---------- Store'u kaydet ----------
    useEffect(() => {
        const saveStore = async () => {
            try {
                const store: FeedStore = {
                    sources,
                    selectedId,
                    refreshMinutes,
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
    }, [sources, selectedId, refreshMinutes]);

    const selectedSource = sources.find(
        (s) => s.id === selectedId
    );

    // ---------- RSS çekme ----------
    const loadFeedForSource = async (
        source: FeedSource,
        opts?: { silent?: boolean }
    ): Promise<boolean> => {
        const silent = opts?.silent ?? false;

        // URL validasyonu
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

            // Okundu/arşiv durumu korunması için önceki item'lar
            const prevMap = new Map<string, FeedItem>();
            for (const it of items) {
                prevMap.set(it.id, it);
            }

            const nextItems: FeedItem[] = arr.map(
                (item: any, index: number) => {
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
                        archived: prev?.archived ?? false,
                        read: prev?.read ?? false,
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
        setItems([]); // yeni kaynak için listeyi temizle

        const ok = await loadFeedForSource(source, {
            silent: false,
        });

        return ok;
    };

    const removeFeedSource = (id: string) => {
        setSources((prev) => prev.filter((s) => s.id !== id));
        if (selectedId === id) {
            // seçili olan silinirse, başka birine geç veya temizle
            const remaining = sources.filter((s) => s.id !== id);
            const next = remaining[0];
            if (next) {
                setSelectedId(next.id);
                setItems([]); // bir sonraki seçildiğinde yeniden çekilecek
                loadFeedForSource(next, { silent: false }).catch(
                    () => { }
                );
            } else {
                setSelectedId(undefined);
                setItems([]);
            }
        }
    };

    const selectSource = (id: string) => {
        if (id === selectedId) return;
        const found = sources.find((s) => s.id === id);
        if (!found) return;
        setSelectedId(id);
        setItems([]);
        loadFeedForSource(found, { silent: false }).catch(() => { });
    };

    // ---------- Okundu / arşiv ----------
    const toggleArchive = (id: string) => {
        setItems((prev) =>
            prev.map((it) =>
                it.id === id ? { ...it, archived: !it.archived } : it
            )
        );
    };

    const toggleRead = (id: string) => {
        setItems((prev) =>
            prev.map((it) =>
                it.id === id ? { ...it, read: !it.read } : it
            )
        );
    };

    // ---------- Yenileme süresi + otomatik refresh ----------
    const setRefreshMinutes = (min: number) => {
        const safe = Math.min(120, Math.max(1, Math.round(min || 1)));
        _setRefreshMinutes(safe);
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

    // Eğer store yüklendiğinde seçili kaynak varsa, ilk açılışta bir kez çek
    useEffect(() => {
        if (selectedSource && items.length === 0) {
            loadFeedForSource(selectedSource, {
                silent: false,
            }).catch(() => { });
        }
        // sadece selectedSource değiştiğinde tetiklesin
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
                setRefreshMinutes,
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
