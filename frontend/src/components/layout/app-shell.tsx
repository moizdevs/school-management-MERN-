import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import { NAV } from "./nav";

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="grid size-9 place-items-center rounded-xl bg-pine-900 text-brass-300 shadow-press">
        <svg viewBox="0 0 32 32" className="size-5" fill="currentColor" aria-hidden><path d="M16 7 5 12.5l11 5.5 11-5.5L16 7Zm-7 9.2v4.3c0 1.8 3.1 3.5 7 3.5s7-1.7 7-3.5v-4.3l-7 3.5-7-3.5Z" /></svg>
      </span>
    </div>
  );
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-6 pt-6"><Brand /></div>
      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        {NAV[user.role].map((g, gi) => (
          <div key={gi}>
            {g.label && <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end={it.to === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-colors duration-150",
                        "focus-visible:ring-2 focus-visible:ring-pine-500",
                        isActive ? "bg-pine-900 text-white shadow-press" : "text-zinc-600 hover:bg-zinc-900/5 hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <it.icon className={cn("size-[18px] transition-colors", isActive ? "text-brass-300" : "text-zinc-400 group-hover:text-zinc-600")} aria-hidden />
                        {it.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-4 flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 shadow-card backdrop-blur">
        <Avatar name={user.name} src={user.avatar?.url} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs capitalize text-zinc-500">{user.role}</p>
        </div>
        <button
          onClick={() => void logout()}
          aria-label="Sign out"
          className="grid size-11 place-items-center rounded-xl text-zinc-500 outline-none transition-colors hover:bg-zinc-900/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-zinc-900/5 bg-surface/60 lg:block">
        <SideNav />
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900/5 bg-paper/80 px-4 py-2 backdrop-blur-xl lg:hidden">
          <Brand />
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger aria-label="Open menu" className="grid size-11 place-items-center rounded-xl outline-none hover:bg-zinc-900/5 focus-visible:ring-2 focus-visible:ring-pine-500">
              <Menu className="size-5" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 animate-overlay bg-pine-950/40 backdrop-blur-sm" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] animate-sheet bg-paper shadow-pop outline-none">
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Description className="sr-only">Site sections</Dialog.Description>
                <Dialog.Close aria-label="Close menu" className="absolute right-2 top-4 grid size-11 place-items-center rounded-xl outline-none hover:bg-zinc-900/5 focus-visible:ring-2 focus-visible:ring-pine-500"><X className="size-4" /></Dialog.Close>
                <SideNav onNavigate={() => setOpen(false)} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <main key={pathname} className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
