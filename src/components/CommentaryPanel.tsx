// ============================================================
// Meta.Horse 2 — Commentary Panel
// ============================================================

import { useRef, useEffect } from 'react';

interface CommentaryPanelProps {
  lines: string[];
}

export default function CommentaryPanel({ lines }: CommentaryPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  return (
    <div className="panel commentary-panel">
      <h3>COMMENTARY</h3>
      <div className="commentary-scroll" ref={scrollRef}>
        {lines.map((line, i) => (
          <p key={i} className="commentary-line">{line}</p>
        ))}
        {lines.length === 0 && (
          <p className="commentary-empty">Waiting for race to begin...</p>
        )}
      </div>
    </div>
  );
}
