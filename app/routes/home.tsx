import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Plus } from 'lucide-react';
import { SentenceCard } from '../components/SentenceCard';
import { AddSentenceDialog } from '../components/AddSentenceDialog';
import type { Sentence } from '../lib/storage';
import { 
  getSentences, 
  searchSentences, 
  addSentence as addSentenceToStorage, 
  deleteSentence
} from '../lib/storage';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Minimalist Sentence Organizer" },
    { name: "description", content: "Organize and manage your favorite sentences" },
  ];
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [allSentences, setAllSentences] = useState<Sentence[]>(getSentences());
  const [searchValue, setSearchValue] = useState(initialQuery);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  // Filter sentences based on search
  const sentences = useMemo(() => {
    if (!searchValue.trim()) {
      return allSentences;
    }
    return searchSentences(searchValue);
  }, [allSentences, searchValue]);

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
    setDisplayCount(20); // Reset display count on search
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 800
      ) {
        setDisplayCount((prev) => Math.min(prev + 20, sentences.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sentences.length]);

  const handleAddSentence = (text: string, categories: string[]) => {
    addSentenceToStorage(text, categories);
    // Reload data
    setAllSentences(getSentences());
    setAddDialogOpen(false);
  };

  const handleDeleteSentence = (id: string) => {
    deleteSentence(id);
    // Update local state
    setAllSentences(allSentences.filter((s) => s.id !== id));
  };

  const displayedSentences = sentences.slice(0, displayCount);
  const hasResults = sentences.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Search Bar - Notion style */}
      <div className="mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-muted-foreground/60 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-b border-border/30 focus:border-foreground/20 focus:outline-none transition-colors text-[15px] placeholder:text-muted-foreground/40"
          />
        </div>
        
        {/* No results dropdown */}
        {!hasResults && searchValue && (
          <div className="mt-3 bg-background border border-border/40 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              onClick={() => setAddDialogOpen(true)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-foreground/[0.03] transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-md bg-foreground/5 flex items-center justify-center">
                <Plus className="w-4 h-4 text-foreground/60" />
              </div>
              <div>
                <p className="text-[13px] text-foreground/90">No results found</p>
                <p className="text-[12px] text-muted-foreground/60">Click to add new sentence</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Sentences List - Notion style */}
      {displayedSentences.length > 0 ? (
        <div className="space-y-2">
          {displayedSentences.map((sentence) => (
            <SentenceCard
              key={sentence.id}
              sentence={sentence}
              onDelete={handleDeleteSentence}
            />
          ))}
        </div>
      ) : !searchValue ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground/50 text-sm">No sentences yet</p>
          <p className="mt-2 text-muted-foreground/40 text-xs">Type in the search bar to add your first sentence</p>
        </div>
      ) : null}

      {/* Loading indicator */}
      {displayCount < sentences.length && (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground/40">Loading more...</p>
        </div>
      )}

      {/* Add Sentence Dialog */}
      <AddSentenceDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddSentence}
        initialText={searchValue}
      />
    </div>
  );
}
