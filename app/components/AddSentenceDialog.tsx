import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface AddSentenceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, categories: string[]) => void;
  initialText?: string;
}

export function AddSentenceDialog({ open, onClose, onAdd, initialText = '' }: AddSentenceDialogProps) {
  const [text, setText] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Reset and pre-fill text when dialog opens
  useEffect(() => {
    if (open) {
      setText(initialText);
      setCategories([]);
      setCategoryInput('');
    } else {
      setText('');
      setCategories([]);
      setCategoryInput('');
    }
  }, [open, initialText]);

  if (!open) return null;

  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text.trim(), categories);
      setText('');
      setCategories([]);
      setCategoryInput('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (categoryInput.trim()) {
        handleAddCategory();
      }
    }
  };

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

          {/* Categories */}
          <div>
            <label className="block text-[13px] font-medium text-foreground/70 mb-2">
              Categories
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a category..."
                className="flex-1 px-4 py-2.5 text-[14px] bg-transparent border border-border/30 rounded-lg focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/40"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2.5 bg-foreground/[0.06] hover:bg-foreground/[0.1] rounded-lg transition-all flex items-center gap-2 text-foreground/70"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[13px]">Add</span>
              </button>
            </div>

            {/* Category Tags */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.06] rounded-md text-[13px] text-foreground/70 hover:bg-foreground/[0.1] transition-all"
                  >
                    {category}
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="hover:text-foreground/90 transition-colors"
                      aria-label={`Remove ${category}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
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
            disabled={!text.trim()}
            className="px-4 py-2 text-[13px] bg-foreground text-background rounded-lg hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add Sentence
          </button>
        </div>
      </div>
    </div>
  );
}
