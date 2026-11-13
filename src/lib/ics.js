/** Unduh agenda beranda (`AGENDA` item: day, month, title, place, time) sebagai berkas .ics. */
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agu: 7, agt: 7, sep: 8, okt: 9, nov: 10, des: 11 };

/** Agenda beranda → Date (WIB). Tahun = tahun ini, atau tahun depan bila bulannya sudah lewat. */
export function eventDate(ev, now = new Date()) {
  const m = MONTHS[String(ev.month).slice(0, 3).toLowerCase()];
  if (m == null) return null;
  const [h, min] = String(ev.time ?? "09.00").match(/\d{1,2}/g)?.map(Number) ?? [9, 0];
  let year = now.getFullYear();
  if (m < now.getMonth() - 1) year += 1;
  // WIB = UTC+7
  return new Date(Date.UTC(year, m, Number(ev.day), h - 7, min ?? 0));
}

const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function downloadIcs(ev, { filename = "agenda.ics", uid = "agenda" } = {}) {
  const start = eventDate(ev);
  if (!start) return false;
  const end = new Date(start.getTime() + 90 * 60000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sistem Informasi UISI//Agenda//ID",
    "BEGIN:VEVENT",
    `UID:${uid}-${stamp(start)}@si.uisi.ac.id`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.place}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}


const esc = (s = "") => String(s).replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

/** Unduh agenda Warta (startAt/endAt ISO) sebagai .ics — waktu pasti dari CMS, bukan tebakan tahun. */
export function downloadEventIcs({ slug, title, place, summary, startAt, endAt, url }) {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return false;
  const end = endAt ? new Date(endAt) : new Date(start.getTime() + 90 * 60000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sistem Informasi UISI//Warta//ID",
    "BEGIN:VEVENT",
    `UID:${slug}-${stamp(start)}@si.uisi.ac.id`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(place)}`,
    summary ? `DESCRIPTION:${esc(summary)}` : null,
    url ? `URL:${url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href, download: `${slug}.ics` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
  return true;
}

const day = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/**
 * Unduh beberapa tenggat sekaligus sebagai satu .ics (acara sehari penuh + pengingat 3 hari sebelumnya).
 * `items` = [{ uid, title, date: Date, description? }]
 */
export function downloadDeadlinesIcs(items, { filename = "tenggat.ics", prodid = "Beasiswa" } = {}) {
  const valid = items.filter((it) => it?.date instanceof Date && !Number.isNaN(it.date.getTime()));
  if (!valid.length) return false;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//Sistem Informasi UISI//${prodid}//ID`];
  for (const it of valid) {
    const next = new Date(it.date.getFullYear(), it.date.getMonth(), it.date.getDate() + 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${it.uid}-${day(it.date)}@si.uisi.ac.id`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART;VALUE=DATE:${day(it.date)}`,
      `DTEND;VALUE=DATE:${day(next)}`,
      `SUMMARY:${esc(it.title)}`,
      it.description ? `DESCRIPTION:${esc(it.description)}` : null,
      "BEGIN:VALARM",
      "TRIGGER:-P3D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(it.title)}`,
      "END:VALARM",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  const href = URL.createObjectURL(new Blob([lines.filter(Boolean).join("\r\n")], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
  return true;
}
