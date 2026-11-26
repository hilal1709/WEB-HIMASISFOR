import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateRule, initialRegulasi, newArticle, resolveRegulasi, safeRegulasiUrl, validateRegulasi } from "./schema.js";
import { fillRegulasi } from "./copy.js";

test("initial and legacy data preserve the public sections, sample labels, and article IDs", () => {
  const baseline = initialRegulasi();
  const original = resolveRegulasi(validateRegulasi(baseline, { publish: true }));
  assert.equal(original.pasalCount, 22);
  assert.equal(original.chapters[0].pasal[2].id, "1-3");
  assert.equal(original.chapters[0].sample, true);
  assert.equal(original.simulator.sks.sample, true);
  assert.equal(original.docs[0].toc, "chapters");

  const legacy = initialRegulasi({ data: JSON.stringify({
    intro: "Pengantar warisan panjang yang sudah tampil di versi publik sebelumnya.",
    version: "2029/2030",
    docs: [{ key: "pedoman", title: "Pedoman Resmi", href: "/files/pedoman.pdf" }],
    notice: { title: "Pembaruan edisi", body: "Naskah sudah diperbarui." },
  }) });
  const imported = resolveRegulasi(validateRegulasi(legacy, { publish: true }));
  assert.match(imported.intro, /Pengantar warisan/);
  assert.equal(imported.version, "2029/2030");
  assert.equal(imported.docs[0].title, "Pedoman Resmi");
  assert.equal(imported.docs[0].sample, false);
  assert.equal(imported.notice.sample, false);
});

test("retains stable references after renumbering and preserves removals and blank optional values", () => {
  const draft = initialRegulasi();
  const article = draft.chapters[0].pasal[2];
  article.no = "VII";
  draft.chapters[0].pasal.unshift(draft.chapters[0].pasal.pop());
  draft.chapters[1].pasal.push({ ...newArticle(), no: "2.5", title: "Pasal baru", formal: "Pedoman.", plain: "Ringkasan." });
  draft.copy.hero.accent = "";
  draft.docs = [];
  draft.notice.visible = false;
  draft.links = [];
  const live = resolveRegulasi(validateRegulasi(draft, { publish: true }));
  assert.equal(live.popular[0].ref, article.id);
  assert.equal(live.simulator.sks.ref, article.id);
  assert.equal(live.chapters[0].pasal.find((entry) => entry.id === article.id).no, "VII");
  assert.equal(live.chapters[1].pasal.at(-1).title, "Pasal baru");
  assert.equal(live.copy.hero.accent, "");
  assert.deepEqual(live.docs, []);
  assert.deepEqual(live.links, []);
  assert.equal(live.notice, null);
});

test("valid drafts may be incomplete and publish catches dangling references and unsafe content", () => {
  const value = initialRegulasi();
  value.chapters[0].pasal[2].visible = false;
  assert.doesNotThrow(() => validateRegulasi(value));
  assert.throws(() => validateRegulasi(value, { publish: true }), /Perbarui rujukan/);
  const document = value.docs[0];
  document.href = "/\\host/evil.pdf";
  assert.throws(() => validateRegulasi(value), /URL berkas/);
  assert.equal(resolveRegulasi(value).docs[0].href, "");
  for (const unsafe of ["javascript:alert(1)", "//host/path", "https://user:password@host/path", "/path\tignored"]) {
    assert.equal(safeRegulasiUrl(unsafe), false);
  }
});

test("curriculum and manual study values update tokens from the same source", () => {
  const value = initialRegulasi();
  const curriculum = { sks: 146, semester: 9 };
  const automatic = resolveRegulasi(value, curriculum);
  assert.deepEqual(automatic.vars, { sks: 146, semester: 9, maxSemester: 15 });
  assert.match(automatic.chapters[0].pasal[0].plain, /146 SKS.*9 semester.*15 semester/);
  value.study = { source: "manual", sks: 151, semester: 10, maximum: 13, extra: 6 };
  const manual = resolveRegulasi(validateRegulasi(value, { publish: true, curriculum }), curriculum);
  assert.deepEqual(manual.vars, { sks: 151, semester: 10, maxSemester: 13 });
  assert.match(manual.chapters[0].pasal[0].formal, /151 SKS.*10 semester.*13 semester/);
  value.study.maximum = 8;
  assert.throws(() => validateRegulasi(value, { publish: true, curriculum }), /Batas maksimum/);
});

test("simulator evaluates editable thresholds and honors the on-time requirement", () => {
  const value = initialRegulasi();
  const { sks, nilai, predikat } = value.simulator;
  sks.rows.reverse();
  assert.equal(calculateRule(sks, "sks", 2.99).sks, 21);
  assert.equal(calculateRule(sks, "sks", 3).sks, 24);
  assert.equal(calculateRule(nilai, "nilai", 78).letter, "AB");
  assert.equal(calculateRule(nilai, "nilai", 77).letter, "B");
  assert.equal(calculateRule(predikat, "predikat", 3.51, true).label, "Dengan pujian");
  assert.equal(calculateRule(predikat, "predikat", 3.51, false).label, "Sangat memuaskan");
  assert.equal(calculateRule(predikat, "predikat", 1.99), null);
  nilai.rows[0].min = nilai.rows[1].min;
  assert.throws(() => validateRegulasi(value, { publish: true }), /Ambang.*harus unik/);
  assert.equal(fillRegulasi("{no} {constructor}", { no: "I" }), "I {constructor}");
});
