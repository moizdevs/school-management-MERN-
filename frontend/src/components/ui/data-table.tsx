import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Empty, ErrorState, TableSkeleton } from "./states";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide below the md breakpoint to keep mobile tables readable. */
  hideOnMobile?: boolean;
  align?: "right";
}

interface Props<T> {
  rows: T[] | undefined;
  columns: Column<T>[];
  rowKey: (r: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchText?: (r: T) => string;
  toolbar?: ReactNode;
  empty?: { title: string; body?: string; action?: ReactNode };
}

export function DataTable<T>({ rows, columns, rowKey, loading, error, onRetry, searchText, toolbar, empty }: Props<T>) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return s && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(s)) : rows;
  }, [rows, q, searchText]);

  return (
    <div>
      {(searchText || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-900/5 px-5 py-3 sm:px-6">
          {searchText && (
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="min-h-11 w-full rounded-xl bg-white pl-9 pr-3 text-sm shadow-[0_0_0_1px_rgb(20_23_26/0.1)] outline-none placeholder:text-zinc-400 focus-visible:shadow-[0_0_0_2px_var(--color-pine-500)]"
              />
            </label>
          )}
          {toolbar}
        </div>
      )}
      {error ? (
        <div className="p-5"><ErrorState message={error} onRetry={onRetry} /></div>
      ) : loading ? (
        <TableSkeleton />
      ) : !filtered.length ? (
        <Empty title={q ? "No matches" : (empty?.title ?? "Nothing here yet")} body={q ? `Nothing matches “${q}”.` : empty?.body} action={q ? undefined : empty?.action} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm tabular-nums">
            <thead>
              <tr className="border-b border-zinc-900/5 text-xs uppercase tracking-wider text-zinc-500">
                {columns.map((c) => (
                  <th key={c.header} scope="col" className={cn("px-3 py-3 font-medium sm:px-5 first:sm:pl-6 last:sm:pr-6", c.hideOnMobile && "hidden md:table-cell", c.align === "right" && "text-right", c.className)}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/5">
              {filtered.map((r, i) => (
                <tr key={rowKey(r)} style={{ "--i": Math.min(i, 12) } as React.CSSProperties} className="stagger transition-colors hover:bg-pine-50/50">
                  {columns.map((c) => (
                    <td key={c.header} className={cn("px-3 py-3 align-middle sm:px-5 first:sm:pl-6 last:sm:pr-6", c.hideOnMobile && "hidden md:table-cell", c.align === "right" && "text-right", c.className)}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
