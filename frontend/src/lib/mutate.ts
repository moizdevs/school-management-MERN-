import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errMsg } from "./api";

/** Mutation + toast + cache invalidation in one place. */
export function useAction<V, R = unknown>(
  fn: (v: V) => Promise<R>,
  opts: { success: string; invalidate: string[]; onDone?: (r: R) => void },
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      toast.success(opts.success);
      opts.invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      opts.onDone?.(r);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
}
