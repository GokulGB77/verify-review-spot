import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, Loader2, SortAsc, MapPin, Shield } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BusinessCard from "@/components/BusinessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePaginatedEntities } from "@/hooks/usePaginatedEntities";
import { useReviews } from "@/hooks/useReviews";
import { transformReviews } from "@/utils/reviewHelpers";

// V2 of Entities Directory with sidebar filters, sorting, and improved layout

export default function EntitiesDirectoryV2() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = usePaginatedEntities();
  const { data: allReviews = [] } = useReviews();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "reviews">("name");
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Flat entities
  const entities = useMemo(() => data?.pages.flatMap((p) => p.data) || [], [data]);
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Compute stats from reviews (latest per user)
  const transformedReviews = useMemo(() => transformReviews(allReviews), [allReviews]);
  const stats = useMemo(() => {
    const totalReviews = transformedReviews.length;
    const verifiedReviews = transformedReviews.filter((r) => r.mainBadge === "Verified User").length;
    const averageRating = totalReviews > 0
      ? (transformedReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";
    return { totalReviews, verifiedReviews, averageRating };
  }, [transformedReviews]);

  // Map entity_id -> rating/review_count (latest only)
  const entityStats = useMemo(() => {
    const byEntity: Record<string, { ratingSum: number; count: number }> = {};
    for (const r of transformedReviews) {
      const id = r.business_id;
      if (!byEntity[id]) byEntity[id] = { ratingSum: 0, count: 0 };
      byEntity[id].ratingSum += r.rating;
      byEntity[id].count += 1;
    }
    return Object.fromEntries(
      Object.entries(byEntity).map(([id, v]) => [id, { average_rating: Number((v.ratingSum / Math.max(v.count, 1)).toFixed(1)), review_count: v.count }])
    ) as Record<string, { average_rating: number; review_count: number }>;
  }, [transformedReviews]);

  // Merge stats
  const entitiesWithStats = useMemo(() =>
    entities.map((e: any) => ({
      ...e,
      average_rating: entityStats[e.entity_id]?.average_rating ?? 0,
      review_count: entityStats[e.entity_id]?.review_count ?? 0,
    })),
  [entities, entityStats]);

  // Available categories based on filtered set (excluding category filter)
  const availableCategories = useMemo(() => {
    let items = entitiesWithStats;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((b: any) =>
        b.name.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.industry?.toLowerCase().includes(q) ||
        (b.location as any)?.address?.toLowerCase().includes(q)
      );
    }
    if (verificationFilter !== "all") {
      const isVerified = verificationFilter === "Verified";
      items = items.filter((b: any) => b.is_verified === isVerified);
    }
    const set = new Set(
      items.map((b: any) => b.industry).filter((x: string | undefined) => x && x.trim() !== "")
    );
    return ["all", ...Array.from(set).sort()];
  }, [entitiesWithStats, searchQuery, verificationFilter]);

  // Filter + sort
  const filtered = useMemo(() => {
    let items = entitiesWithStats;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((b: any) =>
        b.name.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.industry?.toLowerCase().includes(q) ||
        (b.location as any)?.address?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") items = items.filter((b: any) => b.industry === categoryFilter);
    if (verificationFilter !== "all") {
      const isVerified = verificationFilter === "Verified";
      items = items.filter((b: any) => b.is_verified === isVerified);
    }

    // sort
    if (sortBy === "name") items = items.sort((a: any, b: any) => a.name.localeCompare(b.name));
    if (sortBy === "rating") items = items.sort((a: any, b: any) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
    if (sortBy === "reviews") items = items.sort((a: any, b: any) => (b.review_count ?? 0) - (a.review_count ?? 0));

    return items;
  }, [entitiesWithStats, searchQuery, categoryFilter, verificationFilter, sortBy]);

  // SEO: title + meta
  useEffect(() => {
    const prevTitle = document.title;
    const title = `Entity Directory V2 | Verifyd Trust`;
    document.title = title;

    const desc = `Explore verified entities with powerful filters, search, and sorting.`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/entities-v2`;

    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    const param = new URLSearchParams(location.search).get('category');
    if (param) setCategoryFilter(param);
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />Loading…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-red-600">Failed to load entities.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Entity Directory</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">V2 — Compare layout and usability with the original directory.</p>
        </header>

        {/* Controls Bar */}
        <section className="mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search entities, categories, or locations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <SortAsc className="h-5 w-5 text-gray-500" />
              <select
                aria-label="Sort entities"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-12 rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                <option value="name">Sort: Name (A→Z)</option>
                <option value="rating">Sort: Rating (High→Low)</option>
                <option value="reviews">Sort: Reviews (High→Low)</option>
              </select>
            </div>
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar Filters */}
          <aside className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>

            {/* Category */}
            <div className="mb-5">
              <div className="text-sm text-gray-600 mb-2">Category</div>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat === "all" ? "All" : cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="mb-5">
              <div className="text-sm text-gray-600 mb-2">Verification</div>
              <div className="flex flex-wrap gap-2">
                {["all", "Verified", "Unverified"].map((status) => (
                  <Button
                    key={status}
                    variant={verificationFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVerificationFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCategoryFilter("all");
                  setVerificationFilter("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Content */}
          <section>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">{totalCount}</div>
                  <div className="text-xs md:text-sm text-gray-600">Total Entities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold text-green-600">{entities.filter((e: any) => e.is_verified).length}</div>
                  <div className="text-xs md:text-sm text-gray-600">Verified Entities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
                  <div className="text-xs md:text-sm text-gray-600">Avg Rating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold text-purple-600">{stats.totalReviews}</div>
                  <div className="text-xs md:text-sm text-gray-600">Total Reviews</div>
                </CardContent>
              </Card>
            </div>

            {/* Result count + active filters summary */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing {filtered.length} of {totalCount} entities
                {(categoryFilter !== "all" || verificationFilter !== "all" || searchQuery.trim()) && (
                  <span className="text-gray-500"> (filtered)</span>
                )}
              </p>
              <div className="flex gap-2">
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">Category: {categoryFilter}</Badge>
                )}
                {verificationFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">{verificationFilter}</Badge>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((b: any) => (
                <BusinessCard
                  key={b.entity_id}
                  entity_id={b.entity_id}
                  name={b.name}
                  industry={b.industry}
                  description={b.description}
                  average_rating={b.average_rating}
                  review_count={b.review_count}
                  is_verified={b.is_verified}
                  location={b.location}
                  contact={b.contact}
                  trust_level={b.trust_level}
                  claimed_by_business={b.claimed_by_business}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No entities found</h3>
                <p className="text-gray-600">Try a different search or clear your filters.</p>
              </div>
            )}

            {/* Load more */}
            {hasNextPage && filtered.length > 0 && (
              <div className="text-center mt-8 space-y-4">
                <p className="text-sm text-gray-600">
                  Showing {filtered.length} of {totalCount} entities
                  {(categoryFilter !== "all" || verificationFilter !== "all" || searchQuery.trim()) && (
                    <span className="text-gray-500"> (filtered)</span>
                  )}
                </p>
                <Button
                  ref={loadMoreButtonRef}
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const currentScrollPosition = window.scrollY;
                    fetchNextPage().then(() => {
                      setTimeout(() => { window.scrollTo(0, currentScrollPosition); }, 100);
                    });
                  }}
                >
                  {isFetchingNextPage ? (
                    <span className="inline-flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…</span>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}

            {!hasNextPage && filtered.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">You have reached the end</p>
              </div>
            )}
          </section>
        </main>

        {/* Compare helper */}
        <div className="text-center mt-10 text-sm text-gray-600">
          Looking for the original? <Link className="text-blue-600 underline" to="/entities">Open Entities Directory (Original)</Link>
        </div>
      </div>
    </div>
  );
}
