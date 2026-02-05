import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { API_URL } from '../lib/api';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
  createdAt: string;
}

interface AddSentenceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, categoryId: string) => void;
  initialText?: string;
  categoryTree: Category[];
  onCategoryTreeChange?: () => void;
}

// 递归扁平化分类树，用于下拉选择
function flattenCategories(categories: Category[], level = 0): Array<{ id: string; name: string; level: number }> {
  const result: Array<{ id: string; name: string; level: number }> = [];
  for (const category of categories) {
    result.push({ id: category.id, name: category.name, level });
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, level + 1));
    }
  }
  return result;
}

export function AddSentenceDialog({ open, onClose, onAdd, initialText = '', categoryTree, onCategoryTreeChange }: AddSentenceDialogProps) {
  const [text, setText] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset and pre-fill text when dialog opens
  useEffect(() => {
    if (open) {
      setText(initialText);
      setCategoryInput('');
      setSelectedCategoryIds([]);
      setShowCategoryDropdown(false);
    } else {
      setText('');
      setCategoryInput('');
      setSelectedCategoryIds([]);
      setShowCategoryDropdown(false);
    }
  }, [open, initialText]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown]);

  // 扁平化分类并过滤匹配项 - 必须在条件返回之前
  // 关键修复：确保 categoryTree 变化时重新计算
  const flattenedCategories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  
  const matchedCategories = useMemo(() => {
    if (!categoryInput.trim()) {
      return flattenedCategories;
    }
    const query = categoryInput.toLowerCase().trim();
    return flattenedCategories.filter(cat => 
      cat.name.toLowerCase().trim().includes(query)
    );
  }, [categoryInput, flattenedCategories]);

  const exactMatch = useMemo(() => {
    if (!categoryInput.trim()) return null;
    const query = categoryInput.toLowerCase().trim();
    return flattenedCategories.find(
      cat => cat.name.toLowerCase().trim() === query
    );
  }, [categoryInput, flattenedCategories]);

  const handleCategoryInputChange = (value: string) => {
    setCategoryInput(value);
    setShowCategoryDropdown(true);
    
    // 如果找到精确匹配，自动选中
    const match = flattenedCategories.find(
      cat => cat.name.toLowerCase().trim() === value.toLowerCase().trim()
    );
    if (match) {
      if (!selectedCategoryIds.includes(match.id)) {
        setSelectedCategoryIds(prev => [...prev, match.id]);
      }
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectCategory = (categoryId: string, categoryName: string) => {
    handleToggleCategory(categoryId);
    // 不清空输入框，允许继续选择多个
  };

  const handleCreateCategory = async () => {
    if (!categoryInput.trim()) {
      return;
    }

    // 如果已经存在，直接添加到选中列表
    if (exactMatch) {
      if (!selectedCategoryIds.includes(exactMatch.id)) {
        setSelectedCategoryIds(prev => [...prev, exactMatch.id]);
      }
      setCategoryInput('');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();
      setSelectedCategoryIds(prev => [...prev, newCategory.id]);
      setCategoryInput('');
      
      // 通知父组件重新加载分类树
      onCategoryTreeChange?.();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    // 如果有输入但还没选中分类，尝试创建或选择
    let finalCategoryIds = [...selectedCategoryIds];
    
    if (categoryInput.trim() && !exactMatch) {
      // 创建新分类
      try {
        const response = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: categoryInput.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create category");
        }

        const newCategory = await response.json();
        finalCategoryIds.push(newCategory.id);
        
        // 通知父组件重新加载分类树
        onCategoryTreeChange?.();
      } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category. Please try again.");
        return;
      }
    } else if (exactMatch && !finalCategoryIds.includes(exactMatch.id)) {
      finalCategoryIds.push(exactMatch.id);
    }

    if (finalCategoryIds.length === 0) {
      return; // 没有分类，不提交
    }

    // 提交 - 使用第一个分类（后端目前只支持单分类）
    onAdd(text.trim(), finalCategoryIds[0]);
    
    // 重置并关闭
    setText('');
    setCategoryInput('');
    setSelectedCategoryIds([]);
    onClose();
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      handleCreateCategory();
    } else if (e.key === 'Escape') {
      setShowCategoryDropdown(false);
    }
  };

  // 条件返回必须在所有 hooks 之后
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-background border border-border/40 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <h2 className="text-[15px] font-medium text-foreground/90">New Sentence</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-foreground/[0.06] transition-all text-foreground/50 hover:text-foreground/80"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Sentence Text */}
          <div>
            <label className="block text-[13px] font-medium text-foreground/70 mb-2">
              Sentence
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a sentence..."
              rows={6}
              className="w-full px-4 py-3 text-[15px] bg-transparent border border-border/30 rounded-lg focus:outline-none focus:border-foreground/30 resize-none transition-colors placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>

          {/* Category Selection - Search bar style */}
          <div className="relative">
            <label className="block text-[13px] font-medium text-foreground/70 mb-2">
              Category
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-muted-foreground/60 transition-colors pointer-events-none" />
              <input
                ref={categoryInputRef}
                type="text"
                value={categoryInput}
                onChange={(e) => handleCategoryInputChange(e.target.value)}
                onFocus={() => setShowCategoryDropdown(true)}
                onKeyDown={handleCategoryKeyDown}
                placeholder="Type to search or create category..."
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-transparent border-b border-border/30 focus:border-foreground/20 focus:outline-none transition-colors placeholder:text-muted-foreground/40"
              />
              
              {/* Dropdown */}
              {showCategoryDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-background border border-border/40 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {/* Matched categories with scroll */}
                  {matchedCategories.length > 0 && (
                    <div className="max-h-64 overflow-y-auto overscroll-contain scrollbar-thin">
                      <div className="py-1">
                        {matchedCategories.map((category) => {
                          const isSelected = selectedCategoryIds.includes(category.id);
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleSelectCategory(category.id, category.name)}
                              className={`w-full px-4 py-2.5 text-left text-[14px] hover:bg-foreground/[0.03] transition-colors flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-foreground/[0.05] text-foreground/90'
                                  : 'text-foreground/70'
                              }`}
                              style={{ paddingLeft: `${16 + category.level * 12}px` }}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-foreground border-foreground'
                                  : 'border-foreground/30'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span>{category.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Create new category option */}
                  {categoryInput.trim() && !exactMatch && (
                    <div className="border-t border-border/30">
                        <button
                          onClick={handleCreateCategory}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-foreground/[0.03] transition-colors text-left"
                        >
                          <div className="w-6 h-6 rounded-md bg-foreground/5 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-foreground/60" />
                          </div>
                          <div>
                            <p className="text-[13px] text-foreground/90">Create "{categoryInput}"</p>
                            <p className="text-[11px] text-muted-foreground/60">Press Enter to create</p>
                          </div>
                        </button>
                    </div>
                  )}
                  
                  {/* No results */}
                  {categoryInput.trim() && matchedCategories.length === 0 && !exactMatch && (
                    <div className="px-4 py-3 text-center">
                      <p className="text-[13px] text-muted-foreground/60">No categories found</p>
                      <button
                        onClick={handleCreateCategory}
                        className="mt-2 text-[12px] text-foreground/70 hover:text-foreground/90 underline"
                      >
                        Create "{categoryInput}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Selected categories indicators */}
            {selectedCategoryIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedCategoryIds.map((categoryId) => {
                  const category = flattenedCategories.find(c => c.id === categoryId);
                  if (!category) return null;
                  return (
                    <span
                      key={categoryId}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] bg-foreground/[0.06] text-foreground/70 rounded"
                    >
                      {category.name}
                      <button
                        onClick={() => handleToggleCategory(categoryId)}
                        className="hover:bg-foreground/[0.1] rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-foreground/50" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/30 bg-foreground/[0.01]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04] rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || (selectedCategoryIds.length === 0 && !categoryInput.trim())}
            className="px-4 py-2 text-[13px] bg-foreground text-background rounded-lg hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add Sentence
          </button>
        </div>
      </div>
    </div>
  );
}
