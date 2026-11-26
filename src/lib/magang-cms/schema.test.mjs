import assert from "node:assert/strict";
import { test } from "node:test";
import { daysLeft, mergeMagang } from "../magang-content.js";
import { initialMagang, kpText, magangLink, resolveMagang, validateMagang, validMagangUrl } from "./schema.js";

const publishable = (value) => validateMagang(value, { publish: true });

test("the old editor's intro, jobs, notice, and document URLs seed the new CMS", () => {
  const legacy = { data: JSON.stringify({
    intro: "Ini adalah pengantar warisan panjang yang harus tetap terbaca sebelum terbit.",
    jobs: [
      { title: "Magang A", company: "Tim A", program: "kp" },
      { title: "Magang A", company: "Tim B", program: "mandiri" },
    ],
    notice: { title: "Pengumuman lama", body: "Isi versi awal." },
    docs: [{ key: "surat", href: "/files/surat.pdf" }],
  }) };
  const original = mergeMagang(legacy);
  const value = initialMagang(legacy);
  assert.deepEqual(value.jobs.map(({ slug }) => slug), original.jobs.map(({ slug }) => slug));
  value.jobs.reverse();
  value.jobs[0].title = "Judul baru";
  const result = resolveMagang(publishable(value));

  assert.equal(result.jobs[0].slug, original.jobs[1].slug);
  assert.equal(result.jobs[0].sample, false);
  assert.equal(result.intro.body, original.intro.body);
  assert.equal(result.notice.title, original.notice.title);
  assert.equal(result.docs[0].href, "/files/surat.pdf");
  assert.equal(result.docs[0].sample, false);
});

test("published empty lists, a hidden banner, and block order survive resolution", () => {
  const value = initialMagang();
  const baseline = resolveMagang(publishable(value));
  assert.equal(baseline.jobs.every((job) => job.sample), true);
  assert.ok(baseline.notice.legacyEvent);
  value.blocks.reverse();
  value.blocks.find((block) => block.key === "jobs").visible = false;
  value.jobs = [];
  value.routes = [];
  value.docs = [];
  value.logbook = [];
  value.notice.visible = false;
  value.copy.hero.title = "Judul baru";
  const result = resolveMagang(publishable(value));
  assert.deepEqual(result.blocks, value.blocks);
  assert.deepEqual(result.jobs, []);
  assert.deepEqual(result.routes, []);
  assert.deepEqual(result.docs, []);
  assert.equal(result.notice, null);
  assert.equal(magangLink(result, "/magang#lowongan"), "");
  assert.equal(magangLink(result, "#lowongan-lama"), "");
  assert.equal(magangLink(result, "#logbook"), "#logbook");
  assert.equal(result.copy.hero.title, "Judul baru");
});

test("drafts can be incomplete while publishing checks required fields and references", () => {
  const value = initialMagang();
  value.jobs[0].title = "";
  assert.equal(validateMagang(value).jobs[0].title, "");
  assert.throws(() => publishable(value), /posisi.*wajib/i);
  value.jobs[0].title = "Posisi";
  value.routes = [];
  assert.throws(() => publishable(value), /jalur yang sudah dihapus/);
  value.jobs = [];
  value.docs = [];
  assert.throws(() => publishable(value), /berkas yang sudah dihapus/);
});

test("curriculum selection, manual and hidden Kerja Praktik, and calendar dates resolve", () => {
  const value = initialMagang();
  const courses = [
    { id: 7, nama: "Kerja Praktik Terbit", sks: 3, semester: 6 },
    { id: 28, nama: "Magang Industri", sks: 5, semester: 5 },
  ];
  assert.equal(resolveMagang(value, courses).kp.nama, "Kerja Praktik Terbit");
  value.kp.courseId = "28";
  assert.equal(resolveMagang(value, courses).kp.sks, 5);
  value.kp.source = "manual";
  value.kp.sks = 12;
  assert.equal(resolveMagang(publishable(value), courses).kp.sks, 12);
  value.kp.source = "hidden";
  const hidden = resolveMagang(value, courses);
  assert.equal(hidden.kp, null);
  assert.equal(kpText("{course} · {sks} SKS", hidden.kp), "");

  value.notice.calendarSource = "manual";
  assert.throws(() => publishable(value), /tanggal dan jam/i);
  value.notice.date = "2028-02-29";
  value.notice.time = "09:05";
  assert.equal(resolveMagang(publishable(value)).notice.startAt, "2028-02-29T09:05:00+07:00");
  value.notice.date = "2027-02-29";
  assert.throws(() => validateMagang(value), /tanggal yang valid/);
});

test("deadline uses calendar days in Jakarta regardless of device time zone", () => {
  assert.equal(daysLeft("2026-11-26", new Date("2026-11-25T16:59:59Z")), 1);
  assert.equal(daysLeft("2026-11-26", new Date("2026-11-25T17:00:00Z")), 0);
  assert.equal(daysLeft("2026-11-26", new Date("2026-11-26T16:59:59Z")), 0);
  assert.equal(daysLeft("2026-11-26", new Date("2026-11-26T17:00:00Z")), -1);
});

test("links accept site and HTTPS assets and reject executable or ambiguous URLs", () => {
  for (const url of ["javascript:alert(1)", "//example.com", "/%2fexample.com", "/%5Cexample.com", "https://user:pass@example.com", "http://example.com", "https://exa mple.com"]) assert.equal(validMagangUrl(url), false, url);
  for (const url of ["/rps/panduan.pdf", "https://example.com/berkas", "#logbook"]) assert.equal(validMagangUrl(url), true, url);
  assert.equal(validMagangUrl("/lottie/briefcase.json", "lottie"), true);
  assert.equal(validMagangUrl("/lottie/../a.json", "lottie"), false);
  assert.equal(validMagangUrl("https://example.com/a.json", "lottie"), false);
  assert.equal(validMagangUrl("#logbook", "image"), false);
});
