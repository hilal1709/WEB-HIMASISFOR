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

