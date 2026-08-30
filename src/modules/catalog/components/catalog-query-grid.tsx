"use client";

import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type TouchEvent,
} from "react";

import { FeedbackState, LoadingState, RetryButton } from "@/components/ui/feedback-state";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import type { ProductPreview as CatalogProductPreview } from "@/modules/catalog/types";

type CatalogQueryGridViewProps = Readonly<{
  products?: readonly CatalogProductPreview[];
  initialPageParam?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}>;

export const CATALOG_DESKTOP_PAGE_SIZE = 12;
export const CATALOG_MOBILE_PAGE_SIZE = 5;

const MOBILE_QUERY = "(max-width: 599px)";
const SWIPE_THRESHOLD = 56;
const SWIPE_DIRECTION_RATIO = 1.25;

export function getCatalogPageNumber(value: string | null | undefined, pageCount: number) {
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return 1;

  return Math.min(parsed, Math.max(pageCount, 1));
}

export function getResizedCatalogPage(
  currentPage: number,
  currentPageSize: number,
  nextPageSize: number,
  itemCount: number,
) {
  const firstVisibleIndex = (Math.max(currentPage, 1) - 1) * currentPageSize;
  const nextPageCount = Math.max(Math.ceil(itemCount / nextPageSize), 1);

  return Math.min(Math.floor(firstVisibleIndex / nextPageSize) + 1, nextPageCount);
}

export function CatalogQueryGridView({
  products,
  initialPageParam,
  isLoading = false,
  isFetching = false,
  error = null,
  onRefresh = () => window.location.reload(),
}: CatalogQueryGridViewProps) {
  if (isLoading) {
    return (
      <div className="catalog-query-state catalog-page__grid" aria-label="Загрузка каталога">
        {Array.from({ length: 4 }, (_, index) => (
          <LoadingState key={index} label={`Загрузка товара ${index + 1}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <FeedbackState
        kind="error"
        title="Не удалось загрузить каталог"
        description="Проверьте подключение и попробуйте обновить данные."
        action={<RetryButton onRetry={onRefresh} />}
      />
    );
  }

  if (!products?.length) {
    return (
      <FeedbackState
        title="Каталог пока пуст"
        description="Новые предметы появятся здесь после обновления коллекции."
        action={<RetryButton onRetry={onRefresh} />}
      />
    );
  }

  return (
    <CatalogQueryGridResults
      products={products}
      initialPageParam={initialPageParam}
      isFetching={isFetching}
      onRefresh={onRefresh}
    />
  );
}

type CatalogQueryGridResultsProps = Readonly<{
  products: readonly CatalogProductPreview[];
  initialPageParam?: string;
  isFetching: boolean;
  onRefresh: () => void;
}>;

function CatalogQueryGridResults({
  products,
  initialPageParam,
  isFetching,
  onRefresh,
}: CatalogQueryGridResultsProps) {
  const [requestedPage, setRequestedPage] = useState(() => initialPageParam ?? "1");
  const paginationStateRef = useRef({
    currentPage: 1,
    pageSize: CATALOG_DESKTOP_PAGE_SIZE,
    itemCount: products.length,
  });
  const subscribeToBreakpoint = useCallback((onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleViewportChange = (event: MediaQueryListEvent) => {
      const state = paginationStateRef.current;
      const nextPageSize = event.matches ? CATALOG_MOBILE_PAGE_SIZE : CATALOG_DESKTOP_PAGE_SIZE;

      if (state.pageSize !== nextPageSize) {
        const nextPage = getResizedCatalogPage(
          state.currentPage,
          state.pageSize,
          nextPageSize,
          state.itemCount,
        );
        setRequestedPage(String(nextPage));
        updateCatalogUrl(nextPage, "replace");
      }
      onStoreChange();
    };

    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);
  const isMobile = useSyncExternalStore(
    subscribeToBreakpoint,
    getMobileBreakpointSnapshot,
    getMobileBreakpointServerSnapshot,
  );
  const pageSize = isMobile ? CATALOG_MOBILE_PAGE_SIZE : CATALOG_DESKTOP_PAGE_SIZE;
  const pageCount = Math.max(Math.ceil(products.length / pageSize), 1);
  const currentPage = getCatalogPageNumber(requestedPage, pageCount);
  const firstProductIndex = (currentPage - 1) * pageSize;
  const visibleProducts = products.slice(firstProductIndex, firstProductIndex + pageSize);
  const navigationVisible = products.length > pageSize;
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    paginationStateRef.current = { currentPage, pageSize, itemCount: products.length };
  }, [currentPage, pageSize, products.length]);

  useLayoutEffect(() => {
    const handlePopState = () => {
      setRequestedPage(new URL(window.location.href).searchParams.get("page") ?? "1");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useLayoutEffect(() => {
    if (requestedPage === String(currentPage) && !(currentPage === 1 && initialPageParam)) return;
    updateCatalogUrl(currentPage, "replace");
  }, [currentPage, initialPageParam, requestedPage]);

  const showPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount);
    if (safePage === currentPage) return;

    setRequestedPage(String(safePage));
    updateCatalogUrl(safePage, "push");
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest("a, button, input, select, textarea")) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const distanceX = touch.clientX - start.x;
    const distanceY = touch.clientY - start.y;
    if (
      Math.abs(distanceX) < SWIPE_THRESHOLD ||
      Math.abs(distanceX) < Math.abs(distanceY) * SWIPE_DIRECTION_RATIO
    ) {
      return;
    }

    showPage(currentPage + (distanceX < 0 ? 1 : -1));
  };

  return (
    <section className="catalog-query" aria-labelledby="catalog-results-title">
      <div className="catalog-query__heading">
        <p className="text-label-caps text-secondary">Коллекция Virtual Space</p>
        <h2 id="catalog-results-title">Все предметы</h2>
      </div>
      <div className="catalog-query__toolbar">
        <p className="text-body-sm text-secondary" aria-live="polite">
          {isFetching ? "Обновляем коллекцию…" : `В коллекции: ${products.length}`}
        </p>
        <Button variant="ghost" onClick={onRefresh} disabled={isFetching}>
          <RefreshCw aria-hidden="true" size={18} />
          Обновить
        </Button>
      </div>
      <div
        className="catalog-page__grid catalog-query__viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartRef.current = null;
        }}
      >
        {visibleProducts.map((product, index) => (
          <ProductPreview key={`${product.id}-${firstProductIndex + index}`} product={product} />
        ))}
      </div>
      {navigationVisible ? (
        <nav className="catalog-pagination" aria-label="Страницы каталога">
          <Button
            className="catalog-pagination__arrow"
            size="icon"
            variant="secondary"
            aria-label="Предыдущая страница каталога"
            disabled={currentPage === 1}
            onClick={() => showPage(currentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <div className="catalog-pagination__indicators" aria-hidden="true">
            {Array.from({ length: pageCount }, (_, index) => (
              <span
                key={index}
                className="catalog-pagination__indicator"
                data-active={index + 1 === currentPage ? "true" : undefined}
              />
            ))}
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            Страница {currentPage} из {pageCount}
          </span>
          <Button
            className="catalog-pagination__arrow"
            size="icon"
            variant="secondary"
            aria-label="Следующая страница каталога"
            disabled={currentPage === pageCount}
            onClick={() => showPage(currentPage + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      ) : null}
    </section>
  );
}

function getMobileBreakpointSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileBreakpointServerSnapshot() {
  return false;
}

function updateCatalogUrl(page: number, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (page === 1) url.searchParams.delete("page");
  else url.searchParams.set("page", String(page));

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  if (mode === "push") window.history.pushState(null, "", nextUrl);
  else window.history.replaceState(null, "", nextUrl);
}
