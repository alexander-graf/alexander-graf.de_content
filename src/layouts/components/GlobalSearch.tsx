import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
  type: string;
  url: string;
}

interface Props {
  posts: SearchItem[];
  pages: SearchItem[];
}

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function GlobalSearch({ posts, pages }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey 's' / 'S' to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );
      if (isInput) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Shuffle suggestions once when modal opens
  useEffect(() => {
    if (isOpen) {
      const allTags = posts.flatMap(p => p.tags || []);
      const uniqueTags = [...new Set(allTags)].filter(t => t.toLowerCase() !== 'others');
      const defaultList = ['Docker', 'Mautic', 'Traefik', 'Newsletter', 'Linux', 'Vhost', 'Gewinde'];
      const merged = [...new Set([...uniqueTags, ...defaultList])];
      const shuffled = merged.sort(() => 0.5 - Math.random()).slice(0, 5);
      setSuggestions(shuffled);
      setSearchQuery('');
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      setSelectedIndex(-1);
    }
  }, [isOpen, posts]);

  // Autofocus search input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset limit and selected index when query changes
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Search filter logic
  const results = useMemo(() => {
    if (!searchQuery) return [];
    const queryLower = searchQuery.toLowerCase();
    const combined = [...posts, ...pages];
    
    return combined.filter(item => {
      return (
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        item.body.toLowerCase().includes(queryLower) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(queryLower)))
      );
    });
  }, [searchQuery, posts, pages]);

  const displayedResults = useMemo(() => {
    return results.slice(0, visibleCount);
  }, [results, visibleCount]);

  // Keyboard navigation & enter handling
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, displayedResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < displayedResults.length) {
        // If arrow-selected, navigate to that item
        window.location.href = displayedResults[selectedIndex].url;
        setIsOpen(false);
      } else if (displayedResults.length === 1) {
        // If exactly 1 result, navigate immediately
        window.location.href = displayedResults[0].url;
        setIsOpen(false);
      } else if (searchQuery.trim()) {
        // If multiple results, navigate to the blog search results page
        window.location.href = `/blog/?q=${encodeURIComponent(searchQuery.trim())}`;
        setIsOpen(false);
      }
    }
  };

  // Infinite Scroll scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 60) {
      if (visibleCount < results.length) {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, results.length));
      }
    }
  };

  return (
    <>
      {/* Search Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="nav-link flex items-center justify-center text-text/70 hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-2 md:p-1"
        aria-label="Suche öffnen"
      >
        <FaMagnifyingGlass className="size-5" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-text-dark/45 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[75vh] flex flex-col transition-all transform scale-100">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-light/35">
              <FaMagnifyingGlass className="size-5 text-text/40 flex-shrink-0" />
              <input
                type="text"
                ref={inputRef}
                className="w-full bg-transparent border-0 outline-none text-text-dark placeholder-text/40 text-lg focus:ring-0 focus:outline-none"
                placeholder="Beiträge und Seiten durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-text/40 hover:text-text p-1 cursor-pointer"
                >
                  <FaXmark className="size-4" />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold px-2.5 py-1.5 bg-light hover:bg-light/80 text-text/70 rounded-lg border border-border cursor-pointer transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto p-6" onScroll={handleScroll}>
              {searchQuery === '' ? (
                <div>
                  <span className="text-xs font-bold text-text/40 uppercase tracking-wider block mb-3">
                    Besucher suchten auch:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchQuery(suggestion)}
                        className="px-3.5 py-1.5 bg-light hover:bg-primary/10 hover:text-primary rounded-xl text-sm border border-border font-medium transition-colors cursor-pointer text-text"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-text/40 uppercase tracking-wider block mb-3">
                    Suchergebnisse ({results.length})
                  </span>
                  
                  {results.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text/60">Keine Ergebnisse für "{searchQuery}" gefunden.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedResults.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                          <a
                            key={`${item.type}-${item.id}`}
                            href={item.url}
                            className={`block p-4 border rounded-xl transition-all ${
                              isSelected 
                                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                : 'bg-light/30 hover:bg-primary/5 border-border hover:border-primary/25'
                            }`}
                            onClick={() => setIsOpen(false)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <h4 className={`font-semibold transition-colors text-base ${
                                isSelected ? 'text-primary' : 'text-text-dark hover:text-primary'
                              }`}>
                                {item.title}
                              </h4>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                item.type === 'blog' 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-text/10 text-text/80'
                              }`}>
                                {item.type === 'blog' ? 'Blog' : 'Seite'}
                              </span>
                            </div>
                            {item.description && (
                              <p className={`text-sm leading-relaxed line-clamp-2 ${
                                isSelected ? 'text-primary/80' : 'text-text/70'
                              }`}>
                                {item.description}
                              </p>
                            )}
                          </a>
                        );
                      })}
                      {visibleCount < results.length && (
                        <div className="text-center text-xs text-text/40 py-2">
                          Lade weitere Ergebnisse...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
