import { X } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  fontSize: number;
  fontFamily: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
}

const fontOptions = [
  { value: 'system', label: 'System' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
];

export function SettingsDialog({
  open,
  onClose,
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange,
}: SettingsDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-background border border-border/40 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <h2 className="text-[15px] font-medium text-foreground/90">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-foreground/[0.06] transition-all text-foreground/50 hover:text-foreground/80"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Font Family */}
          <div>
            <label className="block text-[13px] font-medium text-foreground/70 mb-3">
              Font
            </label>
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFontFamilyChange(option.value)}
                  className={`
                    px-3 py-2 text-[13px] rounded-md border transition-all
                    ${
                      fontFamily === option.value
                        ? 'bg-foreground/[0.08] border-foreground/20 text-foreground/90'
                        : 'bg-transparent border-border/30 text-foreground/60 hover:bg-foreground/[0.03] hover:border-foreground/20'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-[13px] font-medium text-foreground/70 mb-3">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-foreground/[0.08] rounded-full appearance-none cursor-pointer accent-foreground"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground/50 mt-2">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/30 bg-foreground/[0.01]">
          <p className="text-[12px] text-muted-foreground/50">
            Changes are saved automatically
          </p>
        </div>
      </div>
    </div>
  );
}
