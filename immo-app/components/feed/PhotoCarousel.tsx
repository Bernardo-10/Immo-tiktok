'use client';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (i: number) => setIndex(Math.max(0, Math.min(photos.length - 1, i)));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -50) goTo(index + 1);
    if (delta > 50) goTo(index - 1);
    touchStartX.current = null;
  };

  return (
    <div className="relative h-full w-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <img src={photos[index]} alt="" className="h-full w-full object-cover" />

      <div className="absolute top-3 left-0 right-0 flex justify-center gap-1">
        {photos.map((_, i) => (
          <span key={i} className={`h-1 w-6 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goTo(index - 1); }}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-1 text-white md:block"
        >
          <ChevronLeft />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goTo(index + 1); }}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-1 text-white md:block"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
