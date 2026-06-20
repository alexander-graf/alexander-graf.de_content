import React, { useState, useMemo, useEffect } from 'react';
import { FaSquare, FaSquareCheck, FaXmark, FaMagnifyingGlass, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

interface PostData {
  id: string;
  body: string;
  data: {
    title: string;
    description?: string;
    date?: string;
    image?: string;
    tags: string[];
  };
}

interface Props {
  posts: PostData[];
  summaryLength: number;
}

const POSTS_PER_PAGE = 5;

export default function BlogSearch({ posts, summaryLength }: Props) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Check URL search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        setQuery(q);
      }
    }
  }, []);

  // Extract all unique tags
  const tags = useMemo(() => {
    const allTags = posts.flatMap(p => p.data.tags || []);
    return [...new Set(allTags)].sort((a, b) => a.localeCompare(b));
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchQuery = !query || 
        post.data.title.toLowerCase().includes(query.toLowerCase()) || 
        (post.data.description && post.data.description.toLowerCase().includes(query.toLowerCase())) ||
        post.body.toLowerCase().includes(query.toLowerCase());

      const matchTags = activeTags.size === 0 || 
        [...activeTags].every(tag => post.data.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));

      return matchQuery && matchTags;
    });
  }, [posts, query, activeTags]);

  const isFiltering = query !== '' || activeTags.size > 0;

  // Pagination logic: only apply slice when not filtering
  const paginatedPosts = useMemo(() => {
    if (isFiltering) {
      return filteredPosts;
    }
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, isFiltering, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // Reset page when search query or active tags change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTags]);

  const toggleTag = (tag: string) => {
    const next = new Set(activeTags);
    const lowerTag = tag.toLowerCase();
    if (next.has(lowerTag)) {
      next.delete(lowerTag);
    } else {
      next.add(lowerTag);
    }
    setActiveTags(next);
  };

  const clearFilters = () => {
    setActiveTags(new Set());
    setQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Box */}
        <div className="relative flex-grow">
          <input
            type="text"
            className="form-input w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-border focus:outline-none focus:border-primary"
            placeholder="Suche Beiträge..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50">
            <FaMagnifyingGlass className="size-4" />
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text"
            >
              <FaXmark className="size-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-semibold ${
            showDrawer || activeTags.size > 0
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-white border-border text-text hover:bg-light'
          }`}
        >
          <FaFilter className="size-4" />
          <span>Kategorien</span>
          {activeTags.size > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {activeTags.size}
            </span>
          )}
        </button>
      </div>

      {/* Categories Semi-Modal / Drawer */}
      {showDrawer && (
        <div className="bg-white/95 backdrop-blur p-6 rounded-2xl border border-border shadow-lg mb-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h4 className="h5 font-semibold text-text-dark">Kategorien filtern</h4>
            <div className="flex gap-4">
              {activeTags.size > 0 && (
                <button
                  onClick={() => setActiveTags(new Set())}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Filter zurücksetzen
                </button>
              )}
              <button
                onClick={() => setShowDrawer(false)}
                className="text-text/50 hover:text-text"
              >
                <FaXmark className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const lowerTag = tag.toLowerCase();
              const isActive = activeTags.has(lowerTag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isActive
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-light hover:bg-light/80 text-text border-border'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(activeTags.size > 0 || query) && (
        <div className="flex items-center justify-between mb-6 p-4 bg-light/50 rounded-xl border border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-text/60">Aktive Filter:</span>
            {query && (
              <span className="flex items-center gap-1 px-3 py-1 bg-white text-sm border border-border rounded-lg text-text font-medium">
                Suche: "{query}"
                <button onClick={() => setQuery('')} className="text-text/40 hover:text-text">
                  <FaXmark className="size-3" />
                </button>
              </span>
            )}
            {[...activeTags].map((lowerTag) => {
              const originalTag = tags.find(t => t.toLowerCase() === lowerTag) || lowerTag;
              return (
                <span
                  key={lowerTag}
                  className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm border border-primary/20 rounded-lg font-medium"
                >
                  {originalTag}
                  <button onClick={() => toggleTag(originalTag)} className="text-primary/60 hover:text-primary">
                    <FaXmark className="size-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
          >
            Alle löschen
          </button>
        </div>
      )}

      {/* Posts Count */}
      <div className="mb-6 text-sm text-text/60 font-medium">
        {filteredPosts.length} von {posts.length} Beiträgen gefunden
      </div>

      {/* Posts List */}
      {paginatedPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
          <p className="text-text/60 text-lg">Keine Beiträge gefunden.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {paginatedPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white p-6 md:p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              {post.data.image && (
                <img
                  src={post.data.image}
                  alt={post.data.title}
                  className="w-full h-48 md:h-64 object-cover rounded-xl mb-6"
                />
              )}
              
              {post.data.date && (
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                  {new Date(post.data.date).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}

              <h3 className="h4 font-bold text-text-dark mb-3 hover:text-primary transition-colors">
                <a href={`/blog/${post.id}`}>{post.data.title}</a>
              </h3>

              <p className="text-text/80 mb-6 leading-relaxed">
                {post.data.description || (post.body ? `${post.body.substring(0, summaryLength)}...` : '')}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-1.5">
                  {post.data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-medium bg-light rounded-md border border-border text-text/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a 
                  href={`/blog/${post.id}`} 
                  className="btn btn-primary btn-sm rounded-full text-center"
                >
                  Weiterlesen
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isFiltering && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center p-2.5 rounded-xl border border-border bg-white text-text hover:bg-light disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
          >
            <FaChevronLeft className="size-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white hover:bg-light border border-border text-text'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center p-2.5 rounded-xl border border-border bg-white text-text hover:bg-light disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
          >
            <FaChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
