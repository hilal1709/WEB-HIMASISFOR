"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Copy, Crown, ImagePlus, Trash2, UserPlus, X } from "lucide-react";
import { MediaPicker } from "@/components/home-studio/overlays";
import { ILLUSTRATIONS, OrgTreeIllustration } from "@/components/illustrations/line-illustrations";
import { BANNER_VARIANTS, DIVISION_TONES, LIMITS, MINILAB_ILLUSTRATIONS, findRoot, isDescendant } from "@/lib/struktur-cms/schema";
import { cn } from "@/lib/utils";
import { Chips, Field, Group, IconBtn, LinkField, ListEditor, PosePicker, Segmented, Select, Switch, fid } from "./fields";
import { Face } from "./canvas";

const VARIANT_LABEL = { info: "Info", success: "Berhasil", warning: "Perhatian", brand: "Merek" };

/* ───────────────────────── panel orang ───────────────────────── */

/**
 * Panel orang terpilih. Foto 4:5 seperti di modal publik, identitas, posisi dalam bagan,
 * keahlian/layanan & tugas, lalu aksi pohon.
 */
export function PersonPanel({ people, person, index, update, flags, notify, actions, divisions = [] }) {
  const [picker, setPicker] = useState(false);
  const root = findRoot(people);
  const isRoot = root?.key === person.key;
  const base = `people.${index}`;
  const set = (k) => (v) => update(`${base}.${k}`, v);

  // calon atasan: semua kecuali diri sendiri & bawahannya
  const bosses = useMemo(
    () => people.filter((p) => p.key !== person.key && !isDescendant(people, p.key, person.key)).map((p) => [p.key, `${p.name} — ${p.role || "tanpa jabatan"}`]),
    [people, person.key]
  );
  const team = people.filter((p) => p.reportsTo === person.key);
  const dutyFlag = flags.find((f) => f.startsWith(`${base}.duties.`));

  return (
    <div>
      {/* kepala: foto + nama */}
      <div className="relative overflow-hidden px-5 pb-5 pt-5">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="group/ph relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-gold/60"
            aria-label="Ganti foto"
          >
            {person.photo ? (
              <Image src={person.photo} alt="" fill sizes="112px" className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover/ph:scale-105" />
            ) : (
              <Face p={person} size={112} className="!size-full rounded-none" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent pb-2 pt-6 text-[11px] text-white opacity-0 transition-opacity group-hover/ph:opacity-100">
              <ImagePlus className="size-3.5" /> Ganti
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-soft/80">{isRoot ? "Puncak bagan" : person.group === "staff" ? "Staf · jalur samping" : `Melapor ke ${people.find((p) => p.key === person.reportsTo)?.name ?? "—"}`}</p>
            <p className="mt-1 font-serif text-[1.35rem] leading-tight text-white">{person.name || "Tanpa nama"}</p>
            <p className="mt-1 text-[12.5px] text-white/45">{team.length ? `Membawahi ${team.length} orang` : "Belum membawahi siapa pun"}</p>
            {person.photo && (
              <button type="button" onClick={() => set("photo")("")} className="mt-3 inline-flex items-center gap-1 text-[12px] text-white/45 transition-colors hover:text-[#ff9aa8]">
                <X className="size-3" /> Lepas foto (pakai inisial)
              </button>
            )}
          </div>
        </div>
        <MediaPicker
          open={picker}
          onOpenChange={setPicker}
          kind="image"
          current={person.photo}
          onPick={(src) => {
            set("photo")(src);
            setPicker(false);
          }}
          uploadFolder="uploads/struktur"
          folders={["uploads/struktur", "img/profil", "uploads"]}
          notify={notify}
        />
      </div>

      <Group title="Identitas">
        <Field path={`${base}.name`} label="Nama lengkap" value={person.name} max={90} onChange={set("name")} flag={!person.name?.trim()} />
        <Field path={`${base}.credentials`} label="Gelar & sertifikasi" value={person.credentials} max={120} onChange={set("credentials")} placeholder="S.Kom., M.Kom., …" />
        <Field path={`${base}.role`} label="Jabatan" value={person.role} max={80} onChange={set("role")} flag={!person.role?.trim()} />
      </Group>

      <Group title="Posisi di bagan" hint={isRoot ? "Puncak tampil paling atas dan di sel besar pembuka." : "Bisa juga diubah dengan menyeret kartu di kanvas."}>
        {!isRoot && (
          <>
            <Select path={`${base}.reportsTo`} label="Atasan langsung" value={person.reportsTo} options={bosses} onChange={(v) => actions.move(person.key, v, person.group === "staff" && v !== root?.key ? "main" : person.group)} />
            {person.reportsTo === root?.key && (
              <Segmented
                label="Penempatan"
                value={person.group}
                options={[
                  ["main", "Baris bawahan"],
                  ["staff", "Jalur samping"],
                ]}
                onChange={(v) => actions.move(person.key, person.reportsTo, v)}
              />
            )}
          </>
        )}
        {divisions.length > 0 && (
          <Select
            path={`${base}.division`}
            label="Divisi"
            value={person.division ?? ""}
            options={[["", "Tanpa divisi"], ...divisions.map((d) => [d.key, d.name])]}
            onChange={set("division")}
            hint="Dipakai bentuk bagan Kotak divisi dan sebagai label kecil di kartu."
          />
        )}
        <Switch checked={person.hidden} onChange={set("hidden")} label="Sembunyikan dari halaman publik" hint="Data tetap tersimpan; bawahannya naik ke atasan terdekat yang tampil." />
      </Group>

      <Group title={person.group === "staff" ? "Layanan" : "Bidang keahlian"}>
        <Chips path={`${base}.expertise`} label="Topik" items={person.expertise ?? []} onChange={set("expertise")} max={LIMITS.expertise} />
      </Group>

      <Group title="Tugas & tanggung jawab" hint="Opsional. Bagian ini hanya tampil di kartu profil bila diisi.">
        <ListEditor
          path={`${base}.duties`}
          items={(person.duties ?? []).map((d) => ({ text: d }))}
          onChange={(xs) => set("duties")(xs.map((x) => x.text ?? ""))}
          fields={[{ k: "text", label: "Tugas", max: 160, multiline: true }]}
          blank={{ text: "" }}
          max={LIMITS.duties}
          addLabel="Tambah tugas"
        />
        {dutyFlag && <p className="text-[12px] text-[#ff9aa8]">Ada tugas yang kalimatnya mirip dengan bagian lain halaman.</p>}
      </Group>

      <Group title="Aksi">
        <div className="grid grid-cols-2 gap-2">
          <Action icon={UserPlus} onClick={() => actions.add(person.key)}>
            Tambah bawahan
          </Action>
          {!isRoot && (
            <Action icon={Copy} onClick={() => actions.duplicate(person.key)}>
              Duplikat
            </Action>
          )}
          {!isRoot && person.group !== "staff" && (
            <Action icon={Crown} onClick={() => actions.promote(person.key)}>
              Jadikan puncak
            </Action>
          )}
          {!isRoot && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 px-2">
              <span className="text-[12px] text-white/50">Urutan</span>
              <span className="flex">
                <IconBtn label="Geser ke kiri" onClick={() => actions.shift(person.key, -1)}>
                  <ArrowLeft className="size-3.5" />
                </IconBtn>
                <IconBtn label="Geser ke kanan" onClick={() => actions.shift(person.key, 1)}>
                  <ArrowRight className="size-3.5" />
                </IconBtn>
              </span>
            </div>
          )}
        </div>
        {!isRoot && (
          <button
            type="button"
            onClick={() => actions.remove(person.key)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e86a7c]/30 py-2.5 text-[13px] text-[#ff9aa8] transition-colors hover:bg-[#e86a7c]/10"
          >
            <Trash2 className="size-4" /> Hapus dari bagan
          </button>
        )}
        <p className="text-[11px] text-white/30">
          Kunci: <code className="font-mono">{person.key}</code>
        </p>
      </Group>
    </div>
  );
}

function Action({ icon: Icon, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-left text-[12.5px] text-white/80 transition-[border-color,background-color,transform] hover:border-gold/50 hover:bg-white/[0.04] active:scale-[0.98]">
      <Icon className="size-4 text-gold-soft" /> {children}
    </button>
  );
}

/** Keadaan kosong saat belum ada kartu terpilih: ringkasan bagan + ilustrasi pohon. */
export function OverviewPanel({ people, onAddRoot }) {
  const root = findRoot(people);
  const hidden = people.filter((p) => p.hidden).length;
  const staff = people.filter((p) => p.group === "staff").length;
  const depth = useMemo(() => {
    const by = Object.fromEntries(people.map((p) => [p.key, p]));
    let max = 0;
    for (const p of people) {
      let d = 0;
      let k = p.reportsTo;
      const seen = new Set();
      while (k && by[k] && !seen.has(k)) {
        seen.add(k);
        d++;
        k = by[k].reportsTo;
      }
      max = Math.max(max, d);
    }
    return max + 1;
  }, [people]);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-[240px] text-gold-soft/80 [&_svg]:w-full">
        <OrgTreeIllustration />
      </div>
      <p className="mt-6 text-center font-serif text-[1.35rem] leading-snug text-white">Pilih satu kartu untuk mengubahnya</p>
      <p className="mx-auto mt-2 max-w-[280px] text-center text-[13px] leading-relaxed text-white/45">Arahkan kursor ke kartu lalu tekan tombol + untuk menambah bawahan, atau seret kartu untuk memindahkan atasan.</p>
      <dl className="mt-7 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 text-center">
        {[
          [people.length, "orang"],
          [depth, "tingkat"],
          [staff, "staf"],
        ].map(([n, l]) => (
          <div key={l} className="border-l border-white/10 py-3 first:border-l-0">
            <dt className="sr-only">{l}</dt>
            <dd className="font-serif text-2xl tabular-nums text-white">{n}</dd>
            <dd className="text-[11px] uppercase tracking-[0.14em] text-white/40">{l}</dd>
          </div>
        ))}
      </dl>
      {hidden > 0 && <p className="mt-3 text-center text-[12px] text-white/40">{hidden} orang disembunyikan dari publik.</p>}
      {!root && (
        <button type="button" onClick={onAddRoot} className="mt-6 w-full rounded-xl bg-gold py-3 text-[14px] font-semibold text-navy">
          Tambah puncak bagan
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── panel lapisan teks ───────────────────────── */

const Mascot = ({ path, v, update }) => (
  <>
    <Switch checked={v.show} onChange={(x) => update(`${path}.show`, x)} label="Tampilkan Elvo" />
    {v.show && (
      <>
        <PosePicker value={v.pose} onChange={(x) => update(`${path}.pose`, x)} />
        <Field path={`${path}.say`} label="Ucapan" value={v.say} max={120} onChange={(x) => update(`${path}.say`, x)} />
      </>
    )}
  </>
);

/** Formulir per lapisan. `flag(path)` → true bila field ditandai kalimat berulang. */
export function LayerPanel({ layer, value: v, people, update, flag }) {
  const F = (path, label, max, extra = {}) => (
    <Field path={path} label={label} value={path.split(".").reduce((o, k) => o?.[k], v)} max={max} onChange={(x) => update(path, x)} flag={flag(path)} {...extra} />
  );

  switch (layer) {
    case "hero":
      return (
        <>
          <Group title="Judul" hint="Dua baris; baris kedua berwarna emas.">
            <div className="grid grid-cols-2 gap-2">
              {F("hero.titleTop", "Baris 1", 40)}
              {F("hero.titleAccent", "Baris 2", 40)}
            </div>
            {F("hero.body", "Paragraf pembuka", 280, { multiline: true })}
          </Group>
          <Group title="Ajakan">
            {F("hero.primaryLabel", "Tombol ke bagan", 30)}
            {F("hero.secondaryLabel", "Tautan ke minilab", 30)}
            {F("hero.leadBadge", "Lencana di foto puncak", 24, { hint: "Kosongkan untuk menyembunyikan lencana." })}
          </Group>
          <Group title="Jejak navigasi" hint="Halaman induk sebelum judul halaman ini.">
            <ListEditor
              path="hero.breadcrumb"
              items={v.hero.breadcrumb}
              onChange={(x) => update("hero.breadcrumb", x)}
              fields={[
                { k: "label", label: "Label", max: 40 },
                { k: "href", label: "Tautan", link: true },
              ]}
              blank={{ label: "", href: "/" }}
              max={LIMITS.breadcrumb}
              title={(it) => it.label}
              addLabel="Tambah tingkat"
            />
            {F("hero.current", "Label halaman ini", 60)}
          </Group>
          <Group title="Maskot">
            <Mascot path="hero.mascot" v={v.hero.mascot} update={update} />
          </Group>
        </>
      );
    case "chart":
      return (
        <>
          <ShapePanel v={v} update={update} flag={flag} />
          <Group title="Kepala bagian">
            <div className="grid grid-cols-2 gap-2">
              {F("chart.titleTop", "Judul", 40)}
              {F("chart.titleAccent", "Aksen", 40)}
            </div>
            {F("chart.body", "Petunjuk", 240, { multiline: true })}
            {F("chart.cardCta", "Ajakan di kartu", 30, { hint: "Teks kecil di kartu pimpinan & dosen. Kosongkan untuk menyembunyikan." })}
          </Group>
          <Group title="Pengumuman" hint="Pita di atas bagan; pengunjung bisa menutupnya.">
            <Switch checked={v.chart.banner.show} onChange={(x) => update("chart.banner.show", x)} label="Tampilkan pengumuman" />
            {v.chart.banner.show && (
              <>
                <Segmented label="Gaya" value={v.chart.banner.variant} options={BANNER_VARIANTS.map((x) => [x, VARIANT_LABEL[x]])} onChange={(x) => update("chart.banner.variant", x)} />
                {F("chart.banner.title", "Judul", 100)}
                {F("chart.banner.body", "Isi", 240, { multiline: true })}
              </>
            )}
          </Group>
        </>
      );
    case "modal":
      return (
        <Group title="Label kartu profil" hint="Muncul di jendela detail saat pengunjung mengeklik seseorang.">
          {F("modal.duties", "Judul daftar tugas", 40)}
          {F("modal.expertise", "Judul keahlian (dosen)", 40)}
          {F("modal.services", "Judul layanan (staf)", 40)}
          <div className="grid grid-cols-2 gap-2">
            {F("modal.reportsTo", "Kotak atasan", 30)}
            {F("modal.manages", "Kotak bawahan", 30)}
          </div>
        </Group>
      );
    case "minilab":
      return (
        <>
          <Group title="Kepala bagian">
            <div className="grid grid-cols-2 gap-2">
              {F("minilab.titleTop", "Judul", 40)}
              {F("minilab.titleAccent", "Aksen", 40)}
            </div>
            {F("minilab.body", "Pengantar", 200, { multiline: true, rows: 2 })}
          </Group>
          <Group title="Kartu minilab">
            {F("minilab.card.kicker", "Label kecil", 30)}
            {F("minilab.card.title", "Nama ruang", 80)}
            {F("minilab.card.body", "Deskripsi", 300, { multiline: true })}
            <Chips path="minilab.card.uses" label="Kegiatan" items={v.minilab.card.uses} onChange={(x) => update("minilab.card.uses", x)} max={LIMITS.uses} />
            <div>
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45">Ilustrasi</p>
              <div className="grid grid-cols-3 gap-2">
                {MINILAB_ILLUSTRATIONS.map(([k, label]) => {
                  const Illu = ILLUSTRATIONS[k];
                  const on = v.minilab.card.illustration === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => update("minilab.card.illustration", k)}
                      aria-pressed={on}
                      className={cn("rounded-xl border p-2 transition-[border-color,background-color]", on ? "border-gold/70 bg-gold/10 text-gold-soft" : "border-white/[0.08] text-white/50 hover:border-white/20")}
                    >
                      <span className="block h-14 [&_svg]:h-full [&_svg]:w-full">
                        <Illu />
                      </span>
                      <span className="mt-1 block text-[10.5px]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Select
              path="minilab.card.head"
              label="Penanggung jawab"
              value={v.minilab.card.head}
              options={[["", "Belum ditetapkan"], ...people.filter((p) => !p.hidden).map((p) => [p.key, p.name])]}
              onChange={(x) => update("minilab.card.head", x)}
            />
            {v.minilab.card.head && F("minilab.card.headLabel", "Label penanggung jawab", 30)}
          </Group>
          <Group title="Kartu direktori dosen">
            <Switch checked={v.minilab.directory.show} onChange={(x) => update("minilab.directory.show", x)} label="Tampilkan kartu" hint="Menampilkan wajah dosen dan tautan ke direktori." />
            {v.minilab.directory.show && (
              <>
                {F("minilab.directory.kicker", "Label kecil", 40)}
                {F("minilab.directory.title", "Judul", 60)}
                {F("minilab.directory.body", "Deskripsi", 200, { multiline: true, rows: 2 })}
                <LinkField path="minilab.directory.href" value={v.minilab.directory.href} onChange={(x) => update("minilab.directory.href", x)} />
              </>
            )}
          </Group>
        </>
      );
    case "closing":
      return (
        <>
          <Group title="Judul">
            <div className="grid grid-cols-2 gap-2">
              {F("closing.titleTop", "Baris 1", 40)}
              {F("closing.titleAccent", "Baris 2", 40)}
            </div>
          </Group>
          <Group title="Kartu layanan">
            <Switch checked={v.closing.service.show} onChange={(x) => update("closing.service.show", x)} label="Tampilkan kartu layanan" />
            {v.closing.service.show && (
              <>
                {F("closing.service.title", "Judul", 60)}
                {F("closing.service.body", "Isi", 200, { multiline: true, rows: 2 })}
                <div className="grid grid-cols-2 gap-2">
                  {F("closing.service.label", "Label tautan", 30)}
                  <LinkField path="closing.service.href" value={v.closing.service.href} onChange={(x) => update("closing.service.href", x)} />
                </div>
              </>
            )}
          </Group>
          <Group title="Tautan bernomor" hint="Ditampilkan 01, 02, 03… sesuai urutan.">
            <ListEditor
              path="closing.next"
              items={v.closing.next}
              onChange={(x) => update("closing.next", x)}
              fields={[
                { k: "kicker", label: "Label kecil", max: 30 },
                { k: "title", label: "Judul", max: 60 },
                { k: "body", label: "Keterangan", max: 140 },
                { k: "href", label: "Tautan", link: true },
              ]}
              blank={{ kicker: "Profil", title: "", body: "", href: "/" }}
              max={LIMITS.next}
              title={(it) => it.title}
              addLabel="Tambah tautan"
            />
          </Group>
          <Group title="Maskot">
            <Mascot path="closing.mascot" v={v.closing.mascot} update={update} />
          </Group>
        </>
      );
    case "curtain":
      return (
        <Group title="Tirai pembuka" hint="Tampil sekali per sesi saat halaman pertama dibuka.">
          <Switch checked={v.curtain.enabled} onChange={(x) => update("curtain.enabled", x)} label="Aktifkan tirai" />
          {v.curtain.enabled && (
            <>
              {F("curtain.kicker", "Label atas", 60)}
              <div className="grid grid-cols-2 gap-2">
                {F("curtain.title", "Judul", 40)}
                {F("curtain.accent", "Aksen", 40)}
              </div>
              {F("curtain.label", "Teks pembaca layar", 60)}
            </>
          )}
        </Group>
      );
    case "seo":
      return (
        <Group title="Mesin pencari" hint="Judul tab & cuplikan di hasil pencarian.">
          {F("seo.title", "Judul halaman", 90)}
          {F("seo.description", "Deskripsi", 200, { multiline: true })}
          <div className="rounded-2xl border border-white/10 bg-white p-4">
            <p className="text-[12px] text-[#4d5156]">sisfor.uisi.ac.id › struktur-organisasi</p>
            <p className="mt-0.5 truncate text-[17px] text-[#1a0dab]">{v.seo.title || "Tanpa judul"}</p>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">{v.seo.description}</p>
          </div>
        </Group>
      );
    default:
      return null;
  }
}

/* ───────────────────────── bentuk bagan ───────────────────────── */

/** Sketsa mini tiap bentuk bagan (SVG garis) untuk pemilih tata letak. */
const LAYOUT_SKETCH = {
  tree: (
    <>
      <rect x="34" y="6" width="22" height="10" rx="2" />
      <path d="M45 16v6M16 22h58M16 22v6M45 22v6M74 22v6" />
      <rect x="6" y="28" width="20" height="9" rx="2" />
      <rect x="35" y="28" width="20" height="9" rx="2" />
      <rect x="64" y="28" width="20" height="9" rx="2" />
      <path d="M45 37v5M38 42h14M38 42v4M52 42v4" />
      <rect x="31" y="46" width="14" height="7" rx="2" />
      <rect x="47" y="46" width="14" height="7" rx="2" />
    </>
  ),
  horizontal: (
    <>
      <rect x="4" y="24" width="18" height="10" rx="2" />
      <path d="M22 29h6M28 10v38M28 10h6M28 29h6M28 48h6" />
      <rect x="34" y="5" width="20" height="9" rx="2" />
      <rect x="34" y="24" width="20" height="9" rx="2" />
      <rect x="34" y="43" width="20" height="9" rx="2" />
      <path d="M54 29h6M60 22v14M60 22h4M60 36h4" />
      <rect x="64" y="18" width="20" height="8" rx="2" />
      <rect x="64" y="32" width="20" height="8" rx="2" />
    </>
  ),
  divisions: (
    <>
      <rect x="34" y="4" width="22" height="10" rx="2" />
      <path d="M45 14v8" />
      <rect x="4" y="22" width="38" height="32" rx="3" />
      <rect x="48" y="22" width="38" height="32" rx="3" />
      <path d="M4 26h38M48 26h38" strokeWidth="2.5" />
      <rect x="9" y="31" width="13" height="8" rx="2" />
      <rect x="24" y="31" width="13" height="8" rx="2" />
      <rect x="9" y="42" width="13" height="8" rx="2" />
      <rect x="53" y="31" width="13" height="8" rx="2" />
      <rect x="68" y="31" width="13" height="8" rx="2" />
    </>
  ),
};
const LAYOUT_OPTIONS = [
  ["tree", "Pohon", "Semua tingkat bercabang ke bawah"],
  ["horizontal", "Mengalir", "Cabang mengalir ke kanan"],
  ["divisions", "Kotak divisi", "Puncak, lalu kotak per divisi"],
];
const TIERS = [
  ["lead", "Puncak"],
  ["level1", "Tingkat 1"],
  ["deeper", "Lebih dalam"],
];
const TONE_DOT = { maroon: "bg-maroon", navy: "bg-[#3b5a9a]", gold: "bg-gold" };
const TONE_LABEL = { maroon: "Marun", navy: "Biru", gold: "Emas" };

/** Bentuk bagan publik: tata letak, tampilan kartu per tingkat, dan divisi. */
function ShapePanel({ v, update, flag }) {
  const [tier, setTier] = useState("lead");
  const c = v.chart;
  const t = c.cards[tier];
  const setT = (k) => (x) => update(`chart.cards.${tier}.${k}`, x);
  const noDivisions = c.layout === "divisions" && !c.divisions.length;

  return (
    <>
      <Group title="Bentuk bagan" hint="Cara bagan digambar di halaman publik. Di layar ponsel bagan selalu tampil sebagai daftar bertingkat.">
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_OPTIONS.map(([k, label, hint]) => {
            const on = c.layout === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => update("chart.layout", k)}
                aria-pressed={on}
                title={hint}
                className={cn(
                  "group/l rounded-2xl border p-2.5 text-left transition-[border-color,background-color,transform] duration-300 active:scale-[0.97]",
                  on ? "border-gold/70 bg-gold/10" : "border-white/[0.08] hover:border-white/25"
                )}
              >
                <svg viewBox="0 0 90 58" className={cn("w-full transition-colors", on ? "text-gold-soft" : "text-white/35 group-hover/l:text-white/60")} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {LAYOUT_SKETCH[k]}
                </svg>
                <span className={cn("mt-2 block text-[12px] font-medium", on ? "text-white" : "text-white/60")}>{label}</span>
              </button>
            );
          })}
        </div>
        {noDivisions && <p className="rounded-xl bg-[#e0a43a]/10 px-3 py-2 text-[12px] text-[#f5d49a]">Belum ada divisi. Tambahkan divisi di bawah; sampai saat itu bagan memakai bentuk pohon.</p>}
      </Group>

      <Group title="Tampilan kartu" hint="Puncak, tingkat 1 (bawahan langsung & staf), dan tingkat lebih dalam diatur terpisah.">
        <Segmented label="Tingkat" value={tier} options={TIERS} onChange={setTier} />
        <Segmented
          label="Foto"
          value={t.photo}
          options={[
            ["portrait", "Potret"],
            ["round", "Bulat"],
            ["none", "Tanpa"],
          ]}
          onChange={setT("photo")}
        />
        <Segmented
          label="Ukuran"
          value={t.size}
          options={[
            ["lg", "Besar"],
            ["md", "Sedang"],
            ["sm", "Kecil"],
          ]}
          onChange={setT("size")}
        />
        <div className="space-y-1">
          <Switch checked={t.credentials} onChange={setT("credentials")} label="Tampilkan gelar" />
          <Switch checked={t.expertise} onChange={setT("expertise")} label="Tampilkan keahlian utama" />
          <Switch checked={t.cta} onChange={setT("cta")} label="Tampilkan ajakan kartu" hint={c.cardCta ? `Teks: ${c.cardCta}` : "Ajakan masih kosong (isi di Kepala bagian)."} />
        </div>
      </Group>

      <Group title="Divisi" hint="Kelompok kerja seperti laboratorium atau kemahasiswaan. Anggota diatur lewat kartu orang di kanvas.">
        <DivisionsEditor items={c.divisions} onChange={(x) => update("chart.divisions", x)} flag={flag} />
        {c.divisions.length > 0 && (
          <Field path="chart.ungroupedLabel" label="Judul kotak tanpa divisi" value={c.ungroupedLabel} max={40} onChange={(x) => update("chart.ungroupedLabel", x)} />
        )}
      </Group>
    </>
  );
}

function DivisionsEditor({ items, onChange, flag }) {
  const set = (i, patch) => onChange(items.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const add = () => {
    const taken = new Set(items.map((d) => d.key));
    let n = items.length + 1;
    while (taken.has(`divisi-${n}`)) n++;
    onChange([...items, { key: `divisi-${n}`, name: `Divisi ${n}`, body: "", tone: DIVISION_TONES[items.length % DIVISION_TONES.length] }]);
  };
  return (
    <div className="space-y-2.5">
      {items.map((d, i) => (
        <div key={d.key} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", TONE_DOT[d.tone])} />
            <span className="truncate text-[12px] text-white/55">{d.name || "Tanpa nama"}</span>
            <span className="ml-auto flex items-center gap-1">
              {DIVISION_TONES.map((tn) => (
                <button
                  key={tn}
                  type="button"
                  aria-label={`Warna ${TONE_LABEL[tn]}`}
                  aria-pressed={d.tone === tn}
                  onClick={() => set(i, { tone: tn })}
                  className={cn("size-5 rounded-full border-2 transition-transform hover:scale-110", TONE_DOT[tn], d.tone === tn ? "border-white" : "border-transparent")}
                />
              ))}
              <IconBtn label="Hapus divisi" danger onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <X className="size-3.5" />
              </IconBtn>
            </span>
          </div>
          <div className="space-y-2">
            <Field path={`chart.divisions.${i}.name`} label="Nama divisi" value={d.name} max={60} onChange={(x) => set(i, { name: x })} />
            <Field path={`chart.divisions.${i}.body`} label="Keterangan singkat" value={d.body} max={160} multiline rows={2} flag={flag(`chart.divisions.${i}.body`)} onChange={(x) => set(i, { body: x })} />
          </div>
        </div>
      ))}
      {items.length < LIMITS.divisions && (
        <button type="button" onClick={add} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3 text-[13px] text-white/55 transition-colors hover:border-gold/50 hover:text-gold-soft">
          <UserPlus className="size-4" /> Tambah divisi
        </button>
      )}
    </div>
  );
}

export { fid };

