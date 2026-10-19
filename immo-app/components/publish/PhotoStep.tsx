'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

type PhotoStepProps = {
  photos: File[];
  onChange: (photos: File[]) => void;
};

// Upload multiple + réorganisation par glisser-déposer natif (aucune
// librairie supplémentaire) — pas d'outil de montage/recadrage intégré,
// conforme au cahier des charges. La première photo sert de couverture.
export function PhotoStep({ photos, onChange }: PhotoStepProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    onChange([...photos, ...Array.from(files)]);
  };

  const removeAt = (i: number) => onChange(photos.filter((_, idx) => idx !== i));

  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return;
    const next = [...photos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    onChange(next);
    setDragIndex(null);
  };

  return (
    <div className="p-4">
      <label className="block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center text-sm text-ink-muted">
        Ajouter des photos
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {photos.map((file, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                Couverture
              </span>
            )}
            <button onClick={() => removeAt(i)} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="mt-2 text-xs text-ink-muted">Au moins une photo est nécessaire pour publier.</p>
      )}
    </div>
  );
}
