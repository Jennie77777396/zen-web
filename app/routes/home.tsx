import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLoaderData, useRevalidator } from 'react-router';
import { Search, Plus } from 'lucide-react';
import { SentenceCard } from '../components/SentenceCard';
import { AddSentenceDialog } from '../components/AddSentenceDialog';
import type { Sentence } from '../lib/storage';
import { searchSentences } from '../lib/storage';
import { API_URL } from '../lib/api';
import type { Route } from './+types/home';

// 后端返回的 Sentence 类型（多分类）
interface ApiSentence {
  id: string;
  content: string;
  categories: {
    id: string;
    name: string;
  }[];
  createdAt: string;
}

// 后端返回的 Category 类型（树结构）
interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
  createdAt: string;
}

interface LoaderData {
  sentences: Sentence[];
  categoryTree: Category[];
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Zen" },
    { name: "description", content: "Organize and manage your favorite sentences" },
  ];
}

export async function clientLoader(): Promise<LoaderData> {
  try {
    const [sentencesResponse, categoryTreeResponse] = await Promise.all([
      fetch(`${API_URL}/sentences`),
      fetch(`${API_URL}/categories/tree`),
    ]);

    if (!sentencesResponse.ok || !categoryTreeResponse.ok) {
      throw new Error("Failed to fetch data");
    }

    const apiSentences: ApiSentence[] = await sentencesResponse.json();
    const categoryTree: Category[] = await categoryTreeResponse.json();

    // 转换后端数据格式到前端格式（多分类）
    const sentences: Sentence[] = apiSentences.map((s) => ({
      id: s.id,
      text: s.content,
      categoryIds: s.categories.map(c => c.id),
      categoryNames: s.categories.map(c => c.name),
      createdAt: new Date(s.createdAt).getTime(),
    }));

    return { sentences, categoryTree };
  } catch (error) {
    console.error("Error loading data:", error);
    // 返回空数据，避免页面崩溃
    return { sentences: [], categoryTree: [] };
  }
}

export default function Home() {
  const { sentences: allSentences, categoryTree } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchValue, setSearchValue] = useState(initialQuery);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  // Filter sentences based on search
  const sentences = useMemo(() => {
    if (!searchValue.trim()) {
      return allSentences;
    }
    return searchSentences(searchValue, allSentences);
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

  const handleAddSentence = async (text: string, categoryIds: string[]) => {
    try {
      const response = await fetch(`${API_URL}/sentences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          categoryIds: categoryIds, // 发送多个分类 ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create sentence");
      }

      setAddDialogOpen(false);
      // 重新加载数据
      revalidator.revalidate();
    } catch (error) {
      console.error("Error adding sentence:", error);
      alert("Failed to add sentence. Please try again.");
    }
  };

  const handleDeleteSentence = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sentence?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sentences/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sentence");
      }

      // 重新加载数据
      revalidator.revalidate();
    } catch (error) {
      console.error("Error deleting sentence:", error);
      alert("Failed to delete sentence. Please try again.");
    }
  };

  const displayedSentences = sentences.slice(0, displayCount);
  const hasResults = sentences.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
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
        categoryTree={categoryTree}
        onCategoryTreeChange={() => revalidator.revalidate()}
      />
    </div>
  );
}
