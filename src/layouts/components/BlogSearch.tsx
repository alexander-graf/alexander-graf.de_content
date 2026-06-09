import React, { useState, useMemo } from 'react';
import { FaSquare, FaSquareCheck, FaXmark, FaMagnifyingGlass } from 'react-icons/fa6';

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

export default function BlogSearch({ posts, summaryLength }: Props) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

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
    <div className="row mt-8">
      {/* Sidebar - Control Panel */}
      <div className="col-12 lg:col-4 mb-8 lg:mb-0">
        <div className="bg-light/60 p-6 rounded-2xl border border-border sticky top-24">
          
          {/* Search Box */}
          <div className="relative mb-6">
            <input
              type="text"
              className="form-input w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-border focus:outline-none focus:border-primary"
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

          {/* Tags Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="h5 font-semibold text-text-dark">Kategorien & Tags</h4>
            {(activeTags.size > 0 || query) && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          {/* Checkbox Tag list */}
          <ul className="space-y-2">
            {tags.map((tag) => {
              const lowerTag = tag.toLowerCase();
              const isActive = activeTags.has(lowerTag);
              return (
                <li key={tag}>
                  <button
                    onClick={() => toggleTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'bg-white hover:bg-white/80 text-text border border-border shadow-sm'
                    }`}
                  >
                    <span className={isActive ? 'text-primary' : 'text-text/40'}>
                      {isActive ? <FaSquareCheck className="size-5" /> : <FaSquare className="size-5" />}
                    </span>
                    <span className="truncate">{tag}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Posts List */}
      <div className="col-12 lg:col-8">
        <div className="mb-6 text-sm text-text/60 font-medium">
          {filteredPosts.length} von {posts.length} Beiträgen gefunden
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
            <p className="text-text/60 text-lg">Keine Beiträge gefunden.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredPosts.map((post) => (
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
      </div>
    </div>
  );
}
