import { Layers, Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/confirm";
import { RowActions } from "@/components/row-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { Empty, ErrorState, TableSkeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useAction } from "@/lib/mutate";
import { useClasses, useSections } from "@/lib/queries";
import type { ClassRec, SectionRec } from "@/lib/types";
import { cn } from "@/lib/utils";

type NameModal = { kind: "class" | "section"; rec?: ClassRec | SectionRec } | null;

export default function Classes() {
  const classes = useClasses();
  const [selected, setSelected] = useState<string>();
  const sections = useSections(selected);
  const [modal, setModal] = useState<NameModal>(null);
  const [del, setDel] = useState<{ kind: "class" | "section"; rec: ClassRec | SectionRec } | null>(null);

  useEffect(() => {
    if (!selected && classes.data?.length) setSelected(classes.data[0]!._id);
  }, [classes.data, selected]);

  const current = classes.data?.find((c) => c._id === selected);

  const save = useAction(
    async (name: string) => {
      const m = modal!;
      if (m.kind === "class")
        return m.rec ? api(`/class/${m.rec._id}`, { method: "PUT", body: { className: name } }) : api("/class/create", { method: "POST", body: { className: name } });
      return m.rec ? api(`/section/${m.rec._id}`, { method: "PUT", body: { sectionName: name } }) : api("/section/create", { method: "POST", body: { sectionName: name, classId: selected } });
    },
    { success: "Saved", invalidate: ["classes", "sections"], onDone: () => setModal(null) },
  );
  const remove = useAction(
    () => api(del!.kind === "class" ? `/class/${del!.rec._id}` : `/section/${del!.rec._id}`, { method: "DELETE" }),
    { success: "Deleted", invalidate: ["classes", "sections"], onDone: () => { if (del?.kind === "class" && del.rec._id === selected) setSelected(undefined); setDel(null); } },
  );

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    save.mutate(String(new FormData(e.currentTarget).get("name")).trim());
  };
  const existing = modal?.rec ? ("className" in modal.rec ? modal.rec.className : modal.rec.sectionName) : "";

  return (
    <>
      <PageHeader eyebrow="Academics" title="Classes & sections" description="Create the grades your school runs and split each into sections."
        actions={<Button onClick={() => setModal({ kind: "class" })}><Plus className="size-4" aria-hidden />New class</Button>} />

      {classes.error ? <ErrorState message={classes.error.message} onRetry={() => classes.refetch()} /> : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <Card.Header><div><Card.Title>Classes</Card.Title><Card.Description>{classes.data?.length ?? 0} total</Card.Description></div></Card.Header>
            {classes.isLoading ? <TableSkeleton rows={4} /> : !classes.data?.length ? (
              <Empty icon={Layers} title="No classes yet" body="Start with your first grade." />
            ) : (
              <ul className="p-2">
                {classes.data.map((c, i) => (
                  <li key={c._id} style={{ "--i": i } as React.CSSProperties} className="stagger">
                    <div className={cn("flex items-center rounded-xl pl-1 transition-colors", c._id === selected ? "bg-pine-900 text-white shadow-press" : "hover:bg-zinc-900/5")}>
                      <button onClick={() => setSelected(c._id)} aria-pressed={c._id === selected} className="min-h-11 flex-1 rounded-xl px-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-pine-500">
                        {c.className}
                      </button>
                      <div className={cn(c._id === selected && "[&_button]:text-pine-100 [&_button:hover]:bg-white/10 [&_button:hover]:text-white")}>
                        <RowActions label={c.className} onEdit={() => setModal({ kind: "class", rec: c })} onDelete={() => setDel({ kind: "class", rec: c })} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <Card.Header>
              <div><Card.Title>{current ? `${current.className} — sections` : "Sections"}</Card.Title><Card.Description>Sections group students within a class.</Card.Description></div>
              <Button size="sm" variant="secondary" disabled={!current} onClick={() => setModal({ kind: "section" })}><Plus className="size-4" aria-hidden />Add section</Button>
            </Card.Header>
            {!current ? <Empty title="Select a class" body="Pick a class on the left to manage its sections." /> :
              sections.isLoading ? <TableSkeleton rows={3} /> :
              !sections.data?.length ? <Empty title="No sections" body={`Add Section A to ${current.className}.`} /> : (
                <ul className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                  {sections.data.map((s, i) => (
                    <li key={s._id} style={{ "--i": i } as React.CSSProperties} className="stagger flex items-center justify-between rounded-xl bg-white pl-4 shadow-[0_0_0_1px_rgb(20_23_26/0.07)]">
                      <span className="font-display text-2xl">{s.sectionName}</span>
                      <RowActions label={s.sectionName} onEdit={() => setModal({ kind: "section", rec: s })} onDelete={() => setDel({ kind: "section", rec: s })} />
                    </li>
                  ))}
                </ul>
              )}
          </Card>
        </div>
      )}

      <Modal open={!!modal} onOpenChange={(o) => !o && setModal(null)} title={`${modal?.rec ? "Rename" : "New"} ${modal?.kind ?? ""}`}>
        {modal && (
          <form onSubmit={submit} className="grid gap-4">
            <Field label={modal.kind === "class" ? "Class name" : "Section name"}>
              {(id) => <Input id={id} name="name" required autoFocus defaultValue={existing} placeholder={modal.kind === "class" ? "Grade 5" : "A"} />}
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
              <Button type="submit" loading={save.isPending}>Save</Button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} loading={remove.isPending}
        title={`Delete ${del?.kind}?`}
        body={del?.kind === "class" ? "Sections, timetable slots and exams tied to this class may be left orphaned." : "This section will be permanently removed."}
        onConfirm={() => remove.mutate(undefined)} />
    </>
  );
}

export type { SectionRec };
