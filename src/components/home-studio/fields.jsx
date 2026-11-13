"use client";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate } from "animejs";
import { Flip } from "@/lib/scroll";
import { POSES, POSE_LABEL } from "@/lib/home-cms/schema";
import { cn } from "@/lib/utils";
import { MediaThumb, useStudioToast } from "./overlays";

/** Konteks Inspector: membuka pustaka media dari field mana pun. */
export const FieldCtx = createContext({ openPicker: () => {} });

const fieldId = (path) => `f-${path.replace(/[^a-z0-9]+/gi, "-")}`;

function Shell({ field, path, children, aside }) {
  return (
    <div id={fieldId(path)} data-field={path} className="group/field scroll-mt-24 rounded-xl transition-colors">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={`${fieldId(path)}-in`} className="text-[12.5px] font-semibold text-ink/80">
          {field.label}
        </label>
        {aside}
      </div>
      {children}
      {field.hint && <p className="mt-1.5 text-xs text-ink/45">{field.hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-[14.5px] text-ink shadow-[inset_0_1px_0_rgb(0_0_0/0.02)] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ink/30 hover:border-ink/20 focus:border-gold focus:shadow-[0_0_0_4px_rgb(201_162_39/0.18)]";

function Counter({ value, max }) {
  const n = (value ?? "").length;
  return <span className={cn("text-[11px] tabular-nums opacity-0 transition-opacity group-focus-within/field:opacity-100", n > max * 0.9 ? "text-red-600" : "text-ink/40")}>{n}/{max}</span>;
}

function TextField({ field, path, value, onChange }) {
  return (
    <Shell field={field} path={path} aside={<Counter value={value} max={300} />}>
      <input id={`${fieldId(path)}-in`} value={value ?? ""} maxLength={300} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </Shell>
  );
}

function TextareaField({ field, path, value, onChange }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 320)}px`;
  }, [value]);
  return (
    <Shell field={field} path={path} aside={<Counter value={value} max={2000} />}>
      <textarea id={`${fieldId(path)}-in`} ref={ref} rows={3} maxLength={2000} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "resize-none leading-relaxed")} />
    </Shell>
  );
}

function LinesField({ field, path, value = [], onChange }) {
  const text = value.join("\n");
  return (
    <Shell field={field} path={path}>
      <div className="relative">
        <textarea
          id={`${fieldId(path)}-in`}
          rows={Math.max(2, value.length)}
          value={text}
          onChange={(e) => onChange(e.target.value.split("\n").slice(0, 6))}
          className={cn(inputCls, "resize-none pl-9 font-serif text-[17px] leading-[1.6]")}
        />
        <span aria-hidden className="pointer-events-none absolute left-3 top-2.5 flex flex-col font-sans text-[11px] leading-[1.6rem] text-ink/30 tabular-nums">
          {value.map((_, i) => (
            <span key={i} className="h-[27.2px] leading-[27.2px]">
              {i + 1}
            </span>
          ))}
        </span>
      </div>
    </Shell>
  );
}

function TagsField({ field, path, value = [], onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <Shell field={field} path={path}>
      <div className={cn(inputCls, "flex flex-wrap items-center gap-1.5 py-2")}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-maroon/[0.08] py-1 pl-2.5 pr-1 text-xs font-medium text-maroon animate-in zoom-in-90 duration-300">
            {tag}
            <button type="button" aria-label={`Hapus ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="grid size-4 place-items-center rounded-full hover:bg-maroon hover:text-white">
              ×
            </button>
          </span>
        ))}
        <input
          id={`${fieldId(path)}-in`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") (e.preventDefault(), add());
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length ? "" : "Ketik lalu Enter"}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
    </Shell>
  );
}

function LinkField({ field, path, value = {}, onChange }) {
  const external = /^https?:\/\//.test(value.href ?? "");
  return (
    <Shell field={field} path={path} aside={value.href && <span className="text-[11px] text-ink/40">{external ? "Tab baru" : "Internal"}</span>}>
      <div className="grid gap-2 sm:grid-cols-[0.9fr_1.1fr]">
        <input id={`${fieldId(path)}-in`} aria-label="Label" placeholder="Label" value={value.label ?? ""} onChange={(e) => onChange({ ...value, label: e.target.value })} className={inputCls} />
        <input aria-label="Alamat" placeholder="/halaman atau https://…" value={value.href ?? ""} onChange={(e) => onChange({ ...value, href: e.target.value })} className={cn(inputCls, "font-mono text-[13px]")} />
      </div>
      {!value.label && <p className="mt-1.5 text-xs text-ink/45">Label kosong = tombol disembunyikan.</p>}
    </Shell>
  );
}

function MediaField({ field, path, value, onChange, kind }) {
  const { openPicker } = useContext(FieldCtx);
  return (
    <Shell field={field} path={path}>
      <div className="flex items-stretch gap-3">
        <button
          type="button"
          onClick={() => openPicker(kind, value, onChange)}
          className="group/media relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-[repeating-conic-gradient(rgb(26_6_7/0.04)_0%_25%,transparent_0%_50%)] bg-[length:14px_14px] transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold"
        >
          {value ? <MediaThumb url={value} kind={kind} /> : <span className="text-xs text-ink/40">Kosong</span>}
          <span className="absolute inset-0 grid place-items-center bg-ink/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover/media:opacity-100">Ganti</span>
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <input id={`${fieldId(path)}-in`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="/img/… atau https://…" className={cn(inputCls, "font-mono text-[12.5px]")} />
          <div className="flex gap-2">
            <button type="button" onClick={() => openPicker(kind, value, onChange)} className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-maroon">
              Pustaka
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/55 hover:bg-ink/5">
                Kosongkan
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function VideoField({ field, path, value = {}, onChange }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3 rounded-2xl border border-ink/[0.07] bg-ink/[0.02] p-3">
      <MediaField field={{ label: `${field.label} — berkas` }} path={`${path}.src`} value={value.src} onChange={set("src")} kind="video" />
      <MediaField field={{ label: "Poster" }} path={`${path}.poster`} value={value.poster} onChange={set("poster")} kind="image" />
      {!field.compact && (
        <div className="grid gap-3 sm:grid-cols-[1fr_96px]">
          <TextField field={{ label: "Judul video" }} path={`${path}.title`} value={value.title} onChange={set("title")} />
          <TextField field={{ label: "Durasi" }} path={`${path}.duration`} value={value.duration} onChange={set("duration")} />
        </div>
      )}
    </div>
  );
}

function PoseField({ field, path, value = {}, onChange }) {
  return (
    <Shell field={field} path={path}>
      <div className="flex gap-1.5 overflow-x-auto pb-2" role="radiogroup" aria-label="Pose Si Elvo">
        {POSES.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={value.pose === p}
            onClick={() => onChange({ ...value, pose: p })}
            title={POSE_LABEL[p]}
            className={cn(
              "group/pose relative grid size-16 shrink-0 place-items-end overflow-hidden rounded-xl border transition-[border-color,background-color] duration-300",
              value.pose === p ? "border-gold bg-gold/15" : "border-ink/10 bg-white hover:border-ink/25"
            )}
          >
            <Image src={`/mascot/elvo-${p}.webp`} alt={POSE_LABEL[p]} width={64} height={80} className="h-14 w-auto translate-y-1 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/pose:-translate-y-0.5" />
          </button>
        ))}
      </div>
      <div className="relative mt-1">
        <span aria-hidden className="absolute -top-1.5 left-6 size-3 rotate-45 border-l border-t border-ink/10 bg-white" />
        <input id={`${fieldId(path)}-in`} value={value.say ?? ""} maxLength={300} onChange={(e) => onChange({ ...value, say: e.target.value })} placeholder="Kalimat balon kata" className={cn(inputCls, "rounded-2xl")} />
      </div>
    </Shell>
  );
}

function ToggleField({ field, path, value, onChange }) {
  return (
    <div id={fieldId(path)} className="flex items-center justify-between gap-4 rounded-xl border border-ink/[0.07] bg-white px-4 py-3">
      <span className="text-[13.5px] font-medium text-ink/80">{field.label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        aria-label={field.label}
        onClick={() => onChange(!value)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300", value ? "bg-maroon" : "bg-ink/15")}
      >
        <span className={cn("absolute left-0 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]", value ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function SelectField({ field, path, value, onChange }) {
  return (
    <Shell field={field} path={path}>
      <div className="flex flex-wrap gap-1.5">
        {field.options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", value === o ? "border-maroon bg-maroon text-white" : "border-ink/12 text-ink/65 hover:border-ink/30")}
          >
            {o}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function ObjectField({ field, path, value = {}, onChange }) {
  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-ink/12 p-4">
      <p className="text-[12.5px] font-semibold text-ink/70">{field.label}</p>
      <Fields fields={field.of} path={path} value={value} onChange={onChange} />
    </div>
  );
}

/** Ringkasan satu item list untuk kepala kartu. */
const summary = (item, of) => {
  for (const f of of) {
    const v = item?.[f.key];
    if (typeof v === "string" && v.trim() && !["image", "lottie"].includes(f.type)) return v;
  }
  return null;
};

function ListField({ field, path, value = [], onChange }) {
  const [open, setOpen] = useState(null);
  const listRef = useRef(null);
  const flipState = useRef(null);
  const added = useRef(null);
  const ids = useRef([]);
  const toast = useStudioToast();
  // id stabil per item agar Flip & key tidak bergantung pada indeks
  while (ids.current.length < value.length) ids.current.push(Math.random().toString(36).slice(2));
  ids.current.length = value.length;

  const withFlip = (fn) => {
    if (listRef.current) flipState.current = Flip.getState(listRef.current.querySelectorAll(":scope > li"));
    fn();
  };
  useLayoutEffect(() => {
    if (flipState.current) {
      Flip.from(flipState.current, { duration: 0.5, ease: "expo.out", absolute: false });
      flipState.current = null;
    }
    if (added.current != null) {
      const el = listRef.current?.children[added.current];
      if (el) animate(el, { opacity: [0, 1], translateY: [10, 0], scale: [0.97, 1], duration: 500, ease: "outExpo" });
      added.current = null;
    }
  });

  const move = (i, d) =>
    withFlip(() => {
      const next = [...value];
      const [it] = next.splice(i, 1);
      next.splice(i + d, 0, it);
      const [id] = ids.current.splice(i, 1);
      ids.current.splice(i + d, 0, id);
      setOpen((o) => (o === i ? i + d : o));
      onChange(next);
    });
  const remove = (i) => {
    const prev = value;
    const prevIds = [...ids.current];
    withFlip(() => {
      ids.current.splice(i, 1);
      onChange(value.filter((_, k) => k !== i));
      setOpen(null);
    });
    toast(`${field.item ?? "Item"} dihapus`, {
      tone: "warn",
      action: {
        label: "Urungkan",
        onClick: () => {
          ids.current = prevIds;
          onChange(prev);
        },
      },
    });
  };
  const add = () => {
    const blank = Object.fromEntries(field.of.map((f) => [f.key, f.type === "list" || f.type === "tags" || f.type === "lines" ? [] : f.type === "toggle" ? false : f.type === "link" ? { label: "", href: "" } : f.type === "object" ? {} : f.type === "select" ? f.options[0] : ""]));
    added.current = value.length;
    setOpen(value.length);
    onChange([...value, blank]);
  };
  const full = field.max && value.length >= field.max;

  return (
    <div id={fieldId(path)} data-field={path} className="scroll-mt-24">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[12.5px] font-semibold text-ink/80">{field.label}</span>
        <span className="text-[11px] text-ink/40 tabular-nums">
          {value.length}
          {field.max ? `/${field.max}` : ""} {field.item?.toLowerCase()}
        </span>
      </div>
      <ol ref={listRef} className="space-y-2">
        {value.map((item, i) => {
          const isOpen = open === i;
          const title = summary(item, field.of);
          return (
            <li key={ids.current[i]} data-flip-id={ids.current[i]} className={cn("overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] duration-300", isOpen ? "border-gold/60 shadow-[0_14px_40px_-24px_rgb(78_14_25/0.5)]" : "border-ink/[0.08] hover:border-ink/20")}>
              <div className="flex items-center gap-2 pl-3 pr-1.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-ink/[0.05] text-[11px] font-semibold text-ink/50 tabular-nums">{i + 1}</span>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="min-w-0 flex-1 truncate py-3 text-left text-[13.5px] font-medium text-ink">
                  {title || <span className="text-ink/35">{field.item} tanpa judul</span>}
                </button>
                <span className="flex shrink-0 items-center opacity-60 transition-opacity hover:opacity-100">
                  <IconBtn label="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconBtn>
                  <IconBtn label="Turunkan" disabled={i === value.length - 1} onClick={() => move(i, 1)}>↓</IconBtn>
                  <IconBtn label="Hapus" onClick={() => remove(i)} danger>
                    ×
                  </IconBtn>
                </span>
              </div>
              <div className={cn("grid transition-[grid-template-rows] duration-500 ease-cinematic", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  {isOpen && (
                    <div className="space-y-4 border-t border-ink/[0.06] p-4">
                      <Fields fields={field.of} path={`${path}.${i}`} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} />
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={add}
        disabled={full}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 py-2.5 text-[13px] font-medium text-ink/55 transition-colors hover:border-maroon hover:bg-maroon/[0.03] hover:text-maroon disabled:pointer-events-none disabled:opacity-40"
      >
        + Tambah {field.item?.toLowerCase() ?? "item"}
      </button>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={cn("grid size-8 place-items-center rounded-lg text-sm text-ink/70 transition-colors disabled:opacity-25", danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-ink/5")}>
      {children}
    </button>
  );
}

const MAP = {
  text: TextField,
  textarea: TextareaField,
  lines: LinesField,
  tags: TagsField,
  link: LinkField,
  image: (p) => <MediaField {...p} kind="image" />,
  lottie: (p) => <MediaField {...p} kind="lottie" />,
  video: VideoField,
  pose: PoseField,
  toggle: ToggleField,
  select: SelectField,
  object: ObjectField,
  list: ListField,
};

/** Render daftar field dari skema. `value` = objek, `onChange` menerima objek baru. */
export function Fields({ fields, path, value = {}, onChange }) {
  return fields.map((f) => {
    const C = MAP[f.type];
    if (!C) return null;
    return <C key={f.key} field={f} path={`${path}.${f.key}`} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />;
  });
}

export { fieldId };
