import { Volume2, Trash2 } from 'lucide-react';
import type { Sentence } from '../lib/storage';

interface SentenceCardProps {
  sentence: Sentence;
  onDelete: (id: string) => void;
}

export function SentenceCard({ sentence, onDelete }: SentenceCardProps) {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="group px-4 py-3 rounded-md hover:bg-foreground/[0.03] transition-all duration-150 border border-transparent hover:border-border/30">
      <div className="flex flex-col gap-3">
        {/* Sentence Text */}
        <p className="text-[15px] leading-[1.6] text-foreground/85">
          {sentence.text}
        </p>

        {/* Bottom Section */}
        <div className="flex items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {sentence.categories.map((category) => (
              <span
                key={category}
                className="px-2 py-0.5 text-[11px] bg-foreground/[0.04] text-foreground/50 rounded hover:bg-foreground/[0.08] hover:text-foreground/70 transition-all cursor-default"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded hover:bg-foreground/[0.08] transition-all text-foreground/40 hover:text-foreground/70"
              aria-label="Play audio"
              title="Listen"
            >
              <Volume2 className="w-[15px] h-[15px]" />
            </button>
            
            <button
              onClick={() => onDelete(sentence.id)}
              className="p-1.5 rounded hover:bg-foreground/[0.08] transition-all text-foreground/40 hover:text-foreground/70"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
