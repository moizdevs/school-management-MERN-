import { Pencil, Trash2 } from "lucide-react";

const btn = "grid size-11 place-items-center rounded-xl text-zinc-500 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pine-500";

export function RowActions({ onEdit, onDelete, label }: { onEdit?: () => void; onDelete?: () => void; label: string }) {
  return (
    <div className="-my-1 flex justify-end">
      {onEdit && <button onClick={onEdit} aria-label={`Edit ${label}`} className={`${btn} hover:bg-zinc-900/5 hover:text-ink`}><Pencil className="size-4" /></button>}
      {onDelete && <button onClick={onDelete} aria-label={`Delete ${label}`} className={`${btn} hover:bg-red-50 hover:text-red-600`}><Trash2 className="size-4" /></button>}
    </div>
  );
}
