import assert from "node:assert/strict";
import test from "node:test";
import { creditsFor } from "../konversi-content.js";
import { konversiText } from "./copy.js";
import { DEFAULT_RULES, clampInput, creditEstimate, fitCourses, initialKonversi, rankCourses, resolveKonversi, validateKonversi } from "./schema.js";

const catalog = [
  { id: "kp-1", slug: "kerja-praktik", nama: "Kerja Praktik", sks: 3, semester: 7, rumpun: "enterprise", rps: { cpmk: [{ teks: "Laporan pekerjaan" }] } },
  { id: "ds-1", slug: "sains-data-terapan", nama: "Sains Data Terapan", sks: 4, semester: 6, rumpun: "data" },
  { id: "mk-1", slug: "pancasila", nama: "Pancasila", sks: 2, semester: 1, rumpun: "fondasi" },
];

test("legacy intro, banner, activity overrides, cap and document URL seed editable content", () => {
  const intro = "Pengantar lama dari editor yang tersimpan dan masih digunakan.";
  const value = initialKonversi({ data: JSON.stringify({
    intro, notice: { title: "Periode dibuka", body: "Cek jadwal." }, cap: 12,
    programs: [{ key: "magang", label: "Magang Industri", weeks: 20 }],
    docs: [{ key: "la", href: "/berkas/la.pdf" }],
  }) }, catalog);
  const publicPage = resolveKonversi(validateKonversi(value, { publish: true, catalog }), catalog);
  assert.equal(publicPage.intro.body, intro);
  assert.equal(publicPage.notice.title, "Periode dibuka");
  assert.equal(publicPage.rules.cap, 12);
  assert.equal(publicPage.rules.sample, false);
  assert.equal(publicPage.programs[0].label, "Magang Industri");
  assert.equal(publicPage.programs[0].weeks, 20);
  assert.equal(publicPage.docs[0].href, "/berkas/la.pdf");
  assert.deepEqual(publicPage.eligible, ["kp-1", "ds-1"]);
  assert.equal(publicPage.cases[0].rows[0].course.nama, "Kerja Praktik");
});

test("empty collections, hidden blocks, custom copy and arbitrary order survive publication", () => {
  const value = initialKonversi(null, catalog);
  value.blocks.reverse();
  value.blocks.find((block) => block.key === "hero").visible = false;
  value.programs = [];
  value.steps = [];
  value.docs = [];
  value.cases = [];
  value.eligible = [];
  value.links = [];
  value.notice.title = "";
  value.copy.feedback.resetTitle = "Mulai kembali?";
  const result = resolveKonversi(validateKonversi(value, { publish: true, catalog }), catalog);
  assert.deepEqual(result.blocks, value.blocks);
  for (const key of ["programs", "steps", "cases", "docs", "courses", "links"]) assert.deepEqual(result[key], []);
  assert.equal(result.notice.title, "");
  assert.equal(result.copy.feedback.resetTitle, "Mulai kembali?");
});

test("copies use declared variables and validate renderable URLs even in drafts", () => {
  const value = initialKonversi(null, catalog);
  assert.equal(konversiText(value.copy.feedback.cap, { cap: 12 }), "Batasnya 12 SKS per semester");
  value.copy.feedback.cap = "{unknown}";
  assert.throws(() => validateKonversi(value), /Variabel teks tidak dikenal/);
  value.copy.feedback.cap = "{cap} SKS";
  value.copy.closing.contactHref = "//example.com";
  assert.throws(() => validateKonversi(value), /Tautan tidak valid/);
  value.copy.closing.contactHref = "#kontak";
  value.copy.course.syllabusHref = "/curiculum#rps-{slug}";
  value.docs[0].href = "javascript:alert(1)";
  assert.throws(() => validateKonversi(value), /Tautan tidak valid/);
});

test("publish rejects unresolved references and read filters references removed after publication", () => {
  const value = initialKonversi(null, catalog);
  const published = validateKonversi(value, { publish: true, catalog });
  assert.throws(() => validateKonversi(value, { publish: true, catalog: catalog.slice(1) }), /tidak ada/);
  const renamed = { ...catalog[1], slug: "data-terapan-baru", nama: "Data Terapan Baru", sks: 3 };
  const result = resolveKonversi(published, [renamed, catalog[2]]);
  assert.deepEqual(result.courses.map(({ slug, sks }) => [slug, sks]), [["data-terapan-baru", 3]]);
  assert.deepEqual(result.cases[0].rows.map((row) => row.course.nama), ["Data Terapan Baru"]);
});

test("configurable estimates, ranking and restored course selections observe published limits", () => {
  const hours = { mode: "jam", weeks: 16, hours: 10 };
  assert.equal(creditsFor(hours, DEFAULT_RULES), 12);
  assert.equal(creditEstimate(hours, { ...DEFAULT_RULES, semesterWeeks: 12, cap: 10 }), 10);
  assert.equal(creditEstimate({ mode: "sks", sks: 7 }, { ...DEFAULT_RULES, transferRatio: 0.5, rounding: "floor" }), 3);
  assert.equal(creditEstimate({ mode: "sks", sks: 7 }, { ...DEFAULT_RULES, transferRatio: 0.5, rounding: "nearest" }), 4);
  assert.equal(creditEstimate({ mode: "sks", sks: 5 }, { ...DEFAULT_RULES, transferRatio: 0.5, rounding: "ceil" }), 3);
  assert.equal(clampInput(20, [2, 10], 3), 10);
  assert.equal(clampInput(null, [2, 10], 3), 3);
  assert.deepEqual(rankCourses(catalog, { recommended: ["ds-1", "kp-1"] }).map(({ id }) => id), ["ds-1", "kp-1", "mk-1"]);
  assert.deepEqual(fitCourses(["sains-data-terapan", "kerja-praktik", "kerja-praktik", "pancasila", "lama"], catalog, 5), ["sains-data-terapan"]);
});
