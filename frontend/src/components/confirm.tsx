import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";

export function ConfirmDialog({
  open, onOpenChange, title, body, confirmLabel = "Delete", loading, onConfirm,
}: { open: boolean; onOpenChange: (o: boolean) => void; title: string; body: string; confirmLabel?: string; loading?: boolean; onConfirm: () => void }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <p className="text-sm text-zinc-600">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
