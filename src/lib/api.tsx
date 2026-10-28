import { useSearchParams } from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  HomeData,
  PageResult,
  Resource,
  SummaryMap,
  SiteData,
} from "../../shared/content";
import { API_BASE_URL } from "./api-base";
import "../components/api-ui.css";

export const CATALOGUE_PAGE_SIZE = 9;
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(100_000)])
        : AbortSignal.timeout(100_000),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      0,
      "Le service est momentanément indisponible. Réessayez dans un instant.",
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status,
      body?.error?.message ?? "Impossible de charger les contenus.",
    );
  if (body === null)
    throw new ApiError(502, "Le service a renvoyé une réponse invalide.");
  return body as T;
}
interface PendingRequest {
  promise: Promise<unknown>;
  controller: AbortController;
  users: number;
  abortTimer?: ReturnType<typeof setTimeout>;
}
const pendingRequests = new Map<string, PendingRequest>();
function acquireRequest(path: string) {
  let pending = pendingRequests.get(path);
  if (!pending) {
    const controller = new AbortController();
    pending = {
      controller,
      users: 0,
      promise: apiGet<unknown>(path, controller.signal),
    };
    pendingRequests.set(path, pending);
    const request = pending;
    const clear = () => {
      if (pendingRequests.get(path) === request) pendingRequests.delete(path);
    };
    pending.promise.then(clear, clear);
  }
  clearTimeout(pending.abortTimer);
  pending.users++;
  return pending;
}
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{
    path: string | null;
    data?: T;
    error?: Error;
  }>({ path: null });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!path) return;
    const request = acquireRequest(path);
    let active = true;
    request.promise
      .then((data) => {
        if (active) setState({ path, data: data as T });
      })
      .catch((error: Error) => {
        if (active && !request.controller.signal.aborted)
          setState({ path, error });
      });
    return () => {
      active = false;
      request.users--;
      request.abortTimer = setTimeout(() => {
        if (request.users === 0) {
          request.controller.abort();
          if (pendingRequests.get(path) === request)
            pendingRequests.delete(path);
        }
      }, 0);
    };
  }, [path, retry]);
  const current = state.path === path ? state : undefined;
  return {
    data: current?.data,
    error: current?.error,
    loading: Boolean(path && !current?.data && !current?.error),
    retry: () => {
      setState({ path: null });
      setRetry((value) => value + 1);
    },
  };
}
type SkeletonVariant = "cards" | "list" | "article" | "detail";

export function ContentSkeleton({
  variant = "cards",
  count = variant === "article" ? 1 : 3,
  label = "Chargement des contenus…",
}: {
  variant?: SkeletonVariant;
  count?: number;
  label?: string;
}) {
  return (
    <div
      className={`api-skeleton api-skeleton-${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="api-skeleton-item" aria-hidden="true" key={index}>
          {variant !== "detail" && <span className="api-skeleton-media" />}
          <span className="api-skeleton-copy">
            <span className="api-skeleton-kicker" />
            <span className="api-skeleton-title" />
            <span className="api-skeleton-line" />
            <span className="api-skeleton-line api-skeleton-line-short" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ home = false }: { home?: boolean }) {
  return (
    <main
      id="main-content"
      className={`api-page-skeleton${home ? " api-home-skeleton" : ""}`}
      aria-busy="true"
    >
      <span className="sr-only">Chargement de la page…</span>
      <section className="api-page-skeleton-hero" aria-hidden="true">
        <div className="api-page-skeleton-copy">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="api-page-skeleton-visual" />
      </section>
      {home && (
        <>
          <section className="api-page-skeleton-section" aria-hidden="true">
            <span className="api-page-skeleton-heading" />
            <ContentSkeleton count={4} />
          </section>
          <section
            className="api-page-skeleton-section api-page-skeleton-dark"
            aria-hidden="true"
          >
            <span className="api-page-skeleton-heading" />
            <ContentSkeleton variant="list" count={3} />
          </section>
          <section className="api-page-skeleton-section" aria-hidden="true">
            <span className="api-page-skeleton-heading" />
            <ContentSkeleton count={3} />
          </section>
        </>
      )}
    </main>
  );
}

export function LoadState({
  loading,
  error,
  retry,
  variant = "cards",
  count,
}: {
  loading?: boolean;
  error?: Error;
  retry?: () => void;
  variant?: SkeletonVariant;
  count?: number;
}) {
  if (!loading && !error) return null;
  if (loading) return <ContentSkeleton variant={variant} count={count} />;
  return (
    <div
      className="api-state"
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      <p>{error?.message}</p>
      {retry && (
        <button type="button" onClick={retry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
const SiteContext = createContext<SiteData | null>(null);
export function SiteProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: SiteData;
}) {
  const state = useApi<SiteData>(initial ? null : "/site");
  const data = initial ?? state.data;
  if (!data)
    return state.error ? (
      <main id="main-content" className="api-bootstrap">
        <p>OCÉAN MÉDIA TV</p>
        <LoadState {...state} />
      </main>
    ) : (
      <PageSkeleton />
    );
  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}
export function useSite() {
  const site = useContext(SiteContext);
  if (!site) throw new Error("Le contexte du site est indisponible.");
  return site;
}
const HomeContext = createContext<HomeData | null>(null);
export function HomeProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: HomeData;
}) {
  const state = useApi<HomeData>(initial ? null : "/home");
  const data = initial ?? state.data;
  if (!data)
    return state.error ? (
      <main id="main-content" className="page-main">
        <LoadState {...state} />
      </main>
    ) : (
      <PageSkeleton home />
    );
  return <HomeContext.Provider value={data}>{children}</HomeContext.Provider>;
}
export function useHome() {
  return useContext(HomeContext);
}
export function useDebounced(value: string, delay = 300) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}
export function useCatalogueFilters(fallback = "") {
  const [search, setSearch] = useSearchParams();
  const update = (name: string, value: string, replace = false) => {
    setSearch(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value && !(name === "category" && value === fallback))
          next.set(name, value);
        else next.delete(name);
        next.delete("page");
        return next;
      },
      { replace, preventScrollReset: true },
    );
  };
  return {
    category: search.get("category") ?? fallback,
    query: search.get("q") ?? "",
    setCategory: (value: string) => update("category", value),
    setQuery: (value: string) => update("q", value, true),
    reset: () => setSearch({}, { preventScrollReset: true }),
  };
}
export function useCollection<R extends Resource>(
  resource: R,
  options: {
    category?: string;
    query?: string;
    limit: number;
    paginated?: boolean;
    exclude?: string;
  },
) {
  const home = useHome();
  const [search, setSearch] = useSearchParams();
  const query = useDebounced(options.query ?? "");
  const category = options.category ?? "";
  const page = options.paginated
    ? Math.max(
        1,
        Math.min(100_000, Number.parseInt(search.get("page") ?? "1", 10) || 1),
      )
    : 1;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(options.limit),
  });
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (options.exclude) params.set("exclude", options.exclude);
  const initial =
    !options.paginated && !category && !query && !options.exclude
      ? (home?.[resource] as PageResult<SummaryMap[R]> | undefined)
      : undefined;
  const state = useApi<PageResult<SummaryMap[R]>>(
    initial ? null : "/" + resource + "?" + params,
  );
  const result = initial ?? state.data;
  return {
    ...state,
    data: result,
    items: result?.items ?? [],
    pagination: result?.pagination,
    setPage: (page: number) =>
      setSearch(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (page > 1) next.set("page", String(page));
          else next.delete("page");
          return next;
        },
        { preventScrollReset: true },
      ),
    page,
  };
}
