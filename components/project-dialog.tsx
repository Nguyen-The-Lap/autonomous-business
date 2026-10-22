"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteProject, saveProject, type ActionState } from "@/lib/actions";

type Project = { id: string; title: string; client: string; description: string; estimate: number };

export function ProjectDialog({ project, label = "New brief" }: { project?: Project; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();
  const [descriptionLength, setDescriptionLength] = useState(project?.description.length ?? 0);

  useEffect(() => {
    if (open) setDescriptionLength(project?.description.length ?? 0);
  }, [open, project?.description]);

  function submit(formData: FormData) {
    setState({});
    startTransition(async () => {
      const result = await saveProject({}, formData);
      setState(result);
      if (!result.error) { setOpen(false); router.refresh(); }
    });
  }

  async function remove(formData: FormData) {
    if (!window.confirm("Delete this brief? This action cannot be undone.")) return;
    const result = await deleteProject(formData);
    if (result.error) { setState(result); return; }
    setOpen(false);
    router.refresh();
  }

  const fields = [
    { name: "title", label: "Project name", value: project?.title ?? "", placeholder: "Brand foundations", maxLength: 100, required: true },
    { name: "client", label: "Client", value: project?.client ?? "", placeholder: "Sunday Studio", maxLength: 100, required: true },
  ];

  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setState({}); }}>
    <DialogTrigger asChild><Button variant={project ? "quiet" : "primary"} aria-label={project ? `Edit ${project.title}` : label}>{project ? <><Pencil size={15}/><span className="sr-only">Edit</span></> : <><FilePlus2 size={16}/>{label}</>}</Button></DialogTrigger>
    <DialogContent aria-describedby="project-description">
      <p className="eyebrow mt-2">{project ? "Polish the details" : "A good place to start"}</p>
      <DialogTitle className="serif mt-1 text-[30px]">{project ? "Refine your brief." : "Start with the essentials."}</DialogTitle>
      <DialogDescription id="project-description" className="mt-2 text-xs leading-6 text-muted">A starting point for your next client conversation. You can come back to edit it whenever you need.</DialogDescription>
      <form action={submit} className="mt-6 grid gap-4">
        {project && <input type="hidden" name="id" value={project.id}/>}
        {fields.map(({ name, label, value, ...input }) => <label key={name} htmlFor={name} className="grid gap-1.5 text-xs font-medium">{label}<input id={name} name={name} className="input" aria-invalid={Boolean(state.fields?.[name])} aria-describedby={state.fields?.[name] ? `${name}-error` : undefined} defaultValue={value} {...input}/>{state.fields?.[name] && <span id={`${name}-error`} className="font-normal text-[#a23c35]">{state.fields[name]}</span>}</label>)}
        <label htmlFor="description" className="grid gap-1.5 text-xs font-medium">Scope notes <span className="font-normal text-muted">What might the work include? Notes are private planning notes, not a client-ready proposal (1,000 characters max).</span><textarea id="description" name="description" className="input min-h-24 resize-y" maxLength={1000} placeholder="Discovery, direction, and the first important deliverables…" defaultValue={project?.description ?? ""} onChange={(event) => setDescriptionLength(event.currentTarget.value.length)} aria-invalid={Boolean(state.fields?.description)} aria-describedby={state.fields?.description ? "description-count description-error" : "description-count"}/><span id="description-count" aria-live="polite" className="text-right text-[11px] font-normal text-muted">{descriptionLength} of 1,000 characters</span>{state.fields?.description && <span id="description-error" className="font-normal text-[#a23c35]">{state.fields.description}</span>}</label>
        <label htmlFor="estimate" className="grid gap-1.5 text-xs font-medium">Starting estimate <span className="font-normal text-muted">USD</span><div className="relative"><span aria-hidden="true" className="absolute left-3 top-2.5 text-muted">$</span><input id="estimate" name="estimate" className="input pl-7" type="number" min="0" max="10000000" step="0.01" inputMode="decimal" placeholder="4,800" defaultValue={project?.estimate ?? ""} required aria-invalid={Boolean(state.fields?.estimate)} aria-describedby={state.fields?.estimate ? "estimate-error" : undefined}/></div>{state.fields?.estimate && <span id="estimate-error" className="font-normal text-[#a23c35]">{state.fields.estimate}</span>}</label>
        {state.error && <p role="alert" className="text-xs text-[#a23c35]">{state.error}</p>}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2"><div>{project && <button type="button" disabled={pending} className="button button-quiet text-[#a04840]" onClick={() => { const data = new FormData(); data.set("id", project.id); void remove(data); }} aria-label="Delete brief"><Trash2 size={15}/>Delete</button>}</div><Button type="submit" disabled={pending}>{pending ? "Saving…" : project ? "Save changes" : "Save brief"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

