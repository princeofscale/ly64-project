import { ShieldCheck, Sparkles } from 'lucide-react';
import { memo } from 'react';

interface FairnessNoteProps {
  clientSeedHash: string;
}

export const FairnessNote = memo(function FairnessNote({ clientSeedHash }: FairnessNoteProps) {
  if (!clientSeedHash) return null;

  return (
    <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500">
      <ShieldCheck className="w-3.5 h-3.5" />
      <span className="truncate">
        Provably fair · hash:{' '}
        <span className="font-mono">{clientSeedHash.slice(0, 16)}…</span>
      </span>
      <Sparkles className="w-3 h-3 ml-auto" />
    </div>
  );
});
