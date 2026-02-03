import { useEffect, useRef } from "react";

type UseInfiniteScrollOptions = {
  /** Callback to load more items */
  onLoadMore: () => void;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Root margin for IntersectionObserver (default: "100px") */
  rootMargin?: string;
  /** Threshold for IntersectionObserver (default: 0.1) */
  threshold?: number;
};

/**
 * Hook for implementing infinite scroll using IntersectionObserver.
 * Returns a ref to attach to the sentinel element at the bottom of your list.
 *
 * @example
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({
 *   onLoadMore: loadMore,
 *   hasMore,
 *   isLoading: loading,
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentinelRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "200px",
  threshold = 0.01,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading, rootMargin, threshold]);

  return { sentinelRef };
}
