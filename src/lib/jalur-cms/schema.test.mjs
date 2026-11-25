import assert from "node:assert/strict";
import { test } from "node:test";
import { initialJalur, newItem, newPath, newStage, readJalurChecks, resolveJalur, stageFromHash, validateJalur } from "./schema.js";

test("imports legacy content and keeps the original public sections and sample flags", () => {
  const value = initialJalur({ data: JSON.stringify({
    intro: "Teks terbaru dari format lama yang sudah tampil di halaman publik.",
    paths: [{ key: "skripsi", title: "Riset mandiri", stages: [{ name: "Ajukan topik", time: "Minggu 1", output: "Usulan", needs: ["Topik"] }] }],
    notice: { title: "Sesi persiapan", body: "Pendaftaran dibuka." },
  }) });
  assert.match(value.intro, /format lama/);
  assert.equal(value.paths[0].title, "Riset mandiri");
  assert.equal(value.paths[0].stages[0].name, "Ajukan topik");
  assert.equal(value.paths[0].sample, false);
  assert.equal(value.paths[1].sample, true);
  assert.equal(value.notice.title, "Sesi persiapan");
  assert.deepEqual(Object.values(value.sections), [true, true, true, true]);
  assert.doesNotThrow(() => validateJalur(value, { publish: true }));
});

test("keeps explicit empty text, hidden sections, dynamic entries, and path visibility", () => {
  const value = initialJalur();
  value.intro = "";
  value.notice.visible = false;
  value.sections.compare = false;
  const path = { ...newPath(), title: "Publikasi", stages: [{ ...newStage(), name: "Kirim naskah" }], ready: [{ ...newItem(), text: "Naskah lengkap" }] };
  value.paths = [path, ...value.paths.map((old) => ({ ...old, visible: false }))];
  const resolved = resolveJalur(validateJalur(value, { publish: true }), []);
  assert.equal(resolved.intro, "");
  assert.equal(resolved.notice.visible, false);
  assert.equal(resolved.sections.compare, false);
  assert.deepEqual(resolved.paths.map(({ key }) => key), [path.key]);
  assert.equal(resolved.paths[0].ready[0].text, "Naskah lengkap");
});

test("preserves legacy and new deep links plus saved readiness when items move", () => {
  const value = initialJalur();
  const path = value.paths[0];
  path.stages.reverse();
  path.ready.reverse();
  path.ready[0].visible = false;
  const { paths } = resolveJalur(value, []);
  assert.deepEqual(stageFromHash(paths, "#jalur-skripsi-2"), { key: "skripsi", stage: "tahap-2" });
  assert.deepEqual(stageFromHash(paths, "#jalur-skripsi/tahap/tahap-2"), { key: "skripsi", stage: "tahap-2" });
  assert.deepEqual(stageFromHash(paths, "#jalur-skripsi"), { key: "skripsi" });
  assert.equal(stageFromHash(paths, "#jalur-skripsi-99"), null);
  const checks = readJalurChecks([true, false, true]);
  assert.deepEqual(paths[0].ready.filter((item) => checks[item.id]).map((item) => item.id), ["item-3", "item-1"]);
  assert.equal(paths[0].ready.length, path.ready.length - 1);
});

test("resolves published curriculum references, manual overrides, and removed courses", () => {
  const value = initialJalur();
  const courses = [
    { id: "ta", nama: "Skripsi", sks: 8, semester: 7 },
    { id: "mr", nama: "Metode Penelitian", slug: "metode", semester: 5 },
  ];
  assert.deepEqual(resolveJalur(value, courses).thesis, { sks: 8, semester: 7 });
  assert.equal(resolveJalur(value, courses).method.href, "/curiculum#rps-metode");
  Object.assign(value.academic, { courseId: "removed", sks: "4", prerequisiteMode: "manual", name: "Metodologi", href: "/curiculum", courseSemester: "6" });
  const result = resolveJalur(validateJalur(value, { publish: true }), courses);
  assert.deepEqual(result.thesis, { sks: 4, semester: null });
  assert.deepEqual(result.method, { nama: "Metodologi", href: "/curiculum", semester: 6 });
});

test("allows incomplete draf fields, then rejects unsafe links and unnamed visible entries at publish", () => {
  const value = initialJalur();
  value.paths.push(newPath());
  assert.doesNotThrow(() => validateJalur(value));
  assert.throws(() => validateJalur(value, { publish: true }), /Beri nama/);
  value.paths.at(-1).visible = false;
  value.notice.href = "javascript:alert(1)";
  assert.throws(() => validateJalur(value, { publish: true }), /HTTPS/);
  value.notice.href = "/berita";
  value.academic.sks = "4.5";
  assert.throws(() => validateJalur(value, { publish: true }), /angka bulat/);
});
