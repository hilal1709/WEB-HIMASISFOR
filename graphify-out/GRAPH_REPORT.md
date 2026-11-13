# Graph Report - Web Sisfor  (2026-11-13)

## Corpus Check
- 578 files · ~2,382,601 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, .css 3, .cmd 1)

## Summary
- 3565 nodes · 10568 edges · 165 communities (139 shown, 26 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 315 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `abc35fab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- live-browser.js
- modern-screenshot.umd.js
- aos-provider.jsx
- dashboard/page.jsx
- [slug]/page.jsx
- Testimoni.jsx
- Container
- 🚀 Panduan Deploy ke Vercel dengan Database
- package.json
- createLiveBrowserDomHelpers
- What You Must Do When Invoked
- CMS Kurikulum - Dokumentasi
- Ringkasan Optimasi yang Telah Dilakukan
- regulasi-akademik/page.jsx
- live.md
- new-work.md
- onboard.md
- prefersReducedMotion
- The Toolkit
- berita-content.js
- modal.jsx
- Simplify the Design
- konversi-provider.jsx
- polish.md
- adapt.md
- createLiveBrowserSessionState
- components.json
- layanan-server.js
- connectSSE
- handleManualEditActivity
- initGlobalBar
- startVariantObserver
- useToast
- animate.md
- Handle `generate`
- scripts
- Generate Report
- story.jsx
- optimize.md
- design-system/page.jsx
- el
- beasiswa-content.js
- profil-lulusan/page.jsx
- eslint.config.mjs
- exchange-desk.jsx
- site-header.jsx
- build.py
- @prisma/client
- critique.md
- react
- scroll.js
- agenda-desk.jsx
- injectSvelteComponentsFromManifest
- clarify.md
- Nielsen's 10 Heuristics
- rule-reader.jsx
- document.md
- quieter.md
- scholarship-modal.jsx
- find-us.jsx
- Web Sisfor - Next.js dengan PostgreSQL
- jalur-kelulusan/page.jsx
- dependencies
- profile-content/page.jsx
- Init flow
- Generate Combined Critique Report
- initPageChat
- Panduan Kelola Galeri Prestasi
- content/page.jsx
- graphify reference: extra exports and benchmark
- Common Cognitive Load Violations
- iOS platform
- impeccable/SKILL.md
- Shape
- onAnnotDown
- program-kelas/page.jsx
- Android platform
- prestasi-content.js
- Persona-Based Design Testing
- actOnAgentTarget
- job-board.jsx
- app/page.jsx
- konversi-sks/page.jsx
- Cognitive Load Assessment
- field-mosaic.jsx
- Impeccable Manual Edit Applier
- impeccable
- live-browser-ignores.js
- curiculum/page.jsx
- Hero.jsx
- graphify reference: query, path, explain
- Region map
- Product
- Visualize: Direction Comps & Asset Production
- resumeSession
- course-catalog.jsx
- seed-homepage.js
- 20260205020326_init/migration.sql
- archive.jsx
- struktur-organisasi/page.jsx
- bottom-nav.jsx
- bootcamp/page.jsx
- Operate
- WEB-HIMASISFOR
- charts.jsx
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Heuristics Scoring Guide
- cn
- seed.js
- Hardening Dimensions
- faq-content.js
- letter-form.jsx
- build
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- compilerOptions
- next.config.js
- 20250101000000_add_page_model/migration.sql
- 20260205021149_add_admin/migration.sql
- 20260205061446_add_page_content/migration.sql
- 20260205070940_add_page_model/migration.sql
- CLAUDE.md
- extraction-spec.md
- postcss.config.mjs
- 20260205062108_add_navbar_items/migration.sql
- { GET, POST }
- layanan-content.js
- devDependencies
- kurikulum-content.js
- loader.jsx
- Beranda — si.uisi.ac.id
- bidang-keahlian/page.jsx
- Read
- line-illustrations.jsx
- site-footer.jsx
- Impeccable Finish Reviewer
- press-loader.jsx
- auth.js
- Impeccable Asset Producer
- enableInlineEdit
- konversi-content.js
- dosen-hero.jsx
- road-hero.jsx
- jalur-kelulusan-content.js
- ref_field_modal
- Responsive Design
- 20261112090000_add_service_request/migration.sql
- Operate mode depth (and Read notes)
- berita-seed.js
- visi-misi/page.jsx
- New visual work
- Extract Flow
- 20261113090000_add_post_event/migration.sql
- noStore
- Diagnostic Scan
- Impeccable Documenter
- prisma.js
- KnowledgeImg.jsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 385 edges
2. `prefersReducedMotion()` - 237 edges
3. `react` - 227 edges
4. `Container()` - 117 edges
5. `useToast()` - 90 edges
6. `PlaceholderTag()` - 89 edges
7. `next` - 88 edges
8. `LottieIllustration()` - 67 edges
9. `SectionHeader()` - 54 edges
10. `ElvoPeek()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Step 1: Run the pass` --references--> `path()`  [INFERRED]
  .claude/skills/impeccable/reference/doctor.md → scripts/lottie/build.py
- `Write the config` --references--> `path()`  [INFERRED]
  .claude/skills/impeccable/reference/live-setup.md → scripts/lottie/build.py
- `Assemble and review` --references--> `box()`  [INFERRED]
  .claude/skills/impeccable/reference/component-review.md → src/components/home/road-hero.jsx
- `Halaman Sambutan Kaprodi (`/sambutan-kaprodi`)` --references--> `PlaceholderTag()`  [INFERRED]
  DESIGN.md → src/components/home/shared.jsx
- `Navigasi (berlaku untuk semua halaman)` --references--> `SiteHeader()`  [INFERRED]
  DESIGN.md → src/components/home/site-header.jsx

## Import Cycles
- 3-file cycle: `src/components/regulasi/doc-modal.jsx -> src/components/regulasi/doc-shelf.jsx -> src/components/regulasi/regulasi-provider.jsx -> src/components/regulasi/doc-modal.jsx`
- 4-file cycle: `src/components/regulasi/doc-modal.jsx -> src/components/regulasi/doc-shelf.jsx -> src/components/regulasi/regulasi-banner.jsx -> src/components/regulasi/regulasi-provider.jsx -> src/components/regulasi/doc-modal.jsx`

## Communities (165 total, 26 thin omitted)

### Community 0 - "live-browser.js"
Cohesion: 0.03
Nodes (136): addManualContextText(), applyGlobalBarLabelState(), applyLiveBarPreference(), applyPlaceholderSizingStyles(), bindEditBadgeProxy(), bufferToBase64(), buildCollapsible(), buildColorModels() (+128 more)

### Community 1 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 2 - "aos-provider.jsx"
Cohesion: 0.18
Nodes (9): aos, src_app_globals, bricolage, inter, metadata, notoSerif, AosProvider(), Providers() (+1 more)

### Community 3 - "dashboard/page.jsx"
Cohesion: 0.18
Nodes (12): DashboardPage(), PENDING, plural(), safeGet(), safeSet(), DashHero(), DetailModal(), MiniList() (+4 more)

### Community 4 - "[slug]/page.jsx"
Cohesion: 0.06
Nodes (25): Profile(), DynamicPage(), generateMetadata(), getPageData(), renderSection(), CareerSection(), Footer(), InfiniteAlumni() (+17 more)

### Community 6 - "Container"
Cohesion: 0.07
Nodes (45): next, TONE, NEXT, WAYS, NEXT, TABS, ElvoPeek(), W (+37 more)

### Community 7 - "🚀 Panduan Deploy ke Vercel dengan Database"
Cohesion: 0.06
Nodes (32): 1. Push Code ke GitHub, Build Error: "prisma:client" not found, 🌐 Deploy ke Vercel, Error: "Can't reach database server", Error: "Error: P1001", Error: "Error: P3009", Error: "PrismaClient is unable to run in this browser environment", Jika pakai database eksternal (Neon/Supabase/Railway): (+24 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, version, clsx, eslint, eslint-config-next, @gsap/react, jose (+15 more)

### Community 9 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 10 - "What You Must Do When Invoked"
Cohesion: 0.13
Nodes (15): Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents), Part C - Merge AST + semantic into final extraction, Step 0 - GitHub repos and multi-path merge (only if a URL or several paths), Step 1 - Ensure graphify is installed, Step 2.5 - Video and audio (only if video files detected), Step 2 - Detect files, Step 3 - Extract entities and relationships (+7 more)

### Community 11 - "CMS Kurikulum - Dokumentasi"
Cohesion: 0.07
Nodes (27): 1. Kelola Informasi Umum, 2. Kelola Semester, 3. Kelola Mata Kuliah, Akses CMS Kurikulum, API Endpoints, Cara Menggunakan, CMS Kurikulum - Dokumentasi, Data tidak muncul di halaman publik (+19 more)

### Community 12 - "Ringkasan Optimasi yang Telah Dilakukan"
Cohesion: 0.07
Nodes (26): 1. Google PageSpeed Insights, 1. **Next.js Configuration Optimization**, 2. Chrome DevTools Lighthouse, 2. **Font Loading Optimization**, 3. Chrome DevTools Performance, 3. **Image Optimization**, 4. Bundle Analyzer (Optional), 4. **Code Splitting & Dynamic Imports** (+18 more)

### Community 13 - "regulasi-akademik/page.jsx"
Cohesion: 0.08
Nodes (37): getData(), metadata, RegulasiAkademikPage(), revalidate, NavBtn(), EASE, fillText(), pad() (+29 more)

### Community 14 - "live.md"
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 15 - "new-work.md"
Cohesion: 0.06
Nodes (32): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings, Recommended Actions (+24 more)

### Community 16 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 17 - "prefersReducedMotion"
Cohesion: 0.05
Nodes (57): Halaman Profil Lulusan (`/profil-lulusan`), gsap, CoinLoader(), BidangHero(), smoothTo(), STROKE, Price(), AskModal() (+49 more)

### Community 18 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 19 - "berita-content.js"
Cohesion: 0.05
Nodes (79): BeritaPage(), metadata, revalidate, esc(), GET(), revalidate, BacaPage(), dynamicParams (+71 more)

### Community 20 - "modal.jsx"
Cohesion: 0.11
Nodes (30): lucide-react, TABS, AccreditationScene(), VIA, CourseSearch(), Mark(), norm(), SUGGEST (+22 more)

### Community 21 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 22 - "konversi-provider.jsx"
Cohesion: 0.24
Nodes (11): CourseModal(), KonversiHero(), pad(), clamp(), Ctx, KonversiProvider(), rankCourses(), smoothTo() (+3 more)

### Community 23 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 24 - "adapt.md"
Cohesion: 0.08
Nodes (22): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Adaptation Strategies (+14 more)

### Community 25 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 26 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 27 - "layanan-server.js"
Cohesion: 0.23
Nodes (18): ref_node_crypto, dynamic, POST(), dynamic, POST(), estimateReady(), buckets, clientIp() (+10 more)

### Community 28 - "connectSSE"
Cohesion: 0.10
Nodes (70): abandonForeignSession(), abandonSupersededGo(), abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure() (+62 more)

### Community 29 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 30 - "initGlobalBar"
Cohesion: 0.08
Nodes (45): agentStatusText(), barPaletteForTheme(), brandMarkSvg(), buildDesignHeader(), buildParamsPanel(), cursorForInsertAxis(), designPanelCss(), detectPageTheme() (+37 more)

### Community 31 - "startVariantObserver"
Cohesion: 0.09
Nodes (47): applyParamDefaults(), applyParamValue(), buildCyclingRow(), closedClipPath(), closeTunePopover(), commitAcceptedVariantToDom(), completeParameterPublication(), cycleVariant() (+39 more)

### Community 32 - "useToast"
Cohesion: 0.09
Nodes (29): Aturan pakai, Auth.js, Design System — Sisfor UISI, Stack, Token, DesignSystemPage(), ShareButton(), LetterModal() (+21 more)

### Community 33 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 34 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 35 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, export, lint, postinstall, start

### Community 36 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 37 - "story.jsx"
Cohesion: 0.14
Nodes (4): ACH_ICONS, WHY_ICONS, ELVO_LINES, PLACEHOLDER_NOTE

### Community 38 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 39 - "design-system/page.jsx"
Cohesion: 0.13
Nodes (16): class-variance-authority, SWATCHES, BackgroundPaths(), Spotlight(), Eyebrow(), Badge(), badgeVariants, Card() (+8 more)

### Community 40 - "el"
Cohesion: 0.09
Nodes (46): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+38 more)

### Community 41 - "beasiswa-content.js"
Cohesion: 0.07
Nodes (43): BeasiswaPage(), getData(), metadata, revalidate, BeasiswaBanner(), BeasiswaProvider(), Ctx, read() (+35 more)

### Community 42 - "profil-lulusan/page.jsx"
Cohesion: 0.15
Nodes (16): getData(), metadata, ProfilLulusanPage(), revalidate, Closing(), ALUMNI, CPL, CURTAIN_KEY (+8 more)

### Community 43 - "eslint.config.mjs"
Cohesion: 0.14
Nodes (8): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc, ref_fs, ref_path, ref_url

### Community 44 - "exchange-desk.jsx"
Cohesion: 0.26
Nodes (11): ExchangeDesk(), Inputs(), MobileDock(), Pocket(), RateWindow(), Result(), SEG, useKonversi() (+3 more)

### Community 45 - "site-header.jsx"
Cohesion: 0.12
Nodes (24): ArrowUpGlyph(), base, ChevronGlyph(), CloseGlyph(), MenuGlyph(), activeMenu(), Mega(), MobileMenu() (+16 more)

### Community 46 - "build.py"
Cohesion: 0.11
Nodes (80): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, PowerShell 5.1: Vertical scrolling stops working (+72 more)

### Community 47 - "@prisma/client"
Cohesion: 0.08
Nodes (13): prisma, bcrypt, prisma, { PrismaClient }, prisma, { PrismaClient }, prisma, { PrismaClient } (+5 more)

### Community 48 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 49 - "react"
Cohesion: 0.06
Nodes (29): animejs, motion, react, swiper, BidangBanner(), BootcampBanner(), CohortCard(), fmtDate() (+21 more)

### Community 50 - "scroll.js"
Cohesion: 0.08
Nodes (26): Toc(), Card(), Cylinder(), IntroLoader(), markDone(), Teeth(), Cursor(), SplitReveal() (+18 more)

### Community 51 - "agenda-desk.jsx"
Cohesion: 0.27
Nodes (10): AgendaDesk(), AgendaPanel(), coverSrc(), dateLong(), dayOf(), MODE, monthOf(), timeOf() (+2 more)

### Community 52 - "injectSvelteComponentsFromManifest"
Cohesion: 0.06
Nodes (52): acceptedDomAlreadyClean(), applyOriginalAttrsToSvelteAnchor(), buildSvelteExpressionTextMap(), buildSveltePropValuesFromLiveElement(), buildSveltePropValuesV2(), clearHandledWrapperReloadStamp(), cloneWithoutElements(), collectTextNodes() (+44 more)

### Community 53 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 54 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 55 - "rule-reader.jsx"
Cohesion: 0.11
Nodes (20): DocCover(), DocShelf(), HEIGHTS, TONE, RegulasiBanner(), POPULAR, RegulasiHero(), useRegulasi() (+12 more)

### Community 56 - "document.md"
Cohesion: 0.08
Nodes (24): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+16 more)

### Community 57 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 58 - "scholarship-modal.jsx"
Cohesion: 0.22
Nodes (13): BeasiswaHero(), smoothTo(), useBeasiswa(), clamp(), CoverageRuler(), Obligations(), Stamp(), ScholarshipModal() (+5 more)

### Community 59 - "find-us.jsx"
Cohesion: 0.23
Nodes (12): FLOOR_ROOMS, FloorPlanIllustration(), isoPath(), isoPoint(), CopyChannel(), FindUs(), ORDER, pct() (+4 more)

### Community 60 - "Web Sisfor - Next.js dengan PostgreSQL"
Cohesion: 0.18
Nodes (10): 1. Konfigurasi Database, 2. Generate Prisma Client, 3. Migrasi Database, 4. Prisma Studio (GUI Database), API Endpoints, Cara Menggunakan, Database Schema, Setup Database PostgreSQL (+2 more)

### Community 61 - "jalur-kelulusan/page.jsx"
Cohesion: 0.12
Nodes (26): @radix-ui/react-dialog, metadata, revalidate, JalurClosing(), JalurHero(), Ctx, JalurProvider(), setHash() (+18 more)

### Community 62 - "dependencies"
Cohesion: 0.06
Nodes (33): dependencies, animejs, aos, bcryptjs, chart.js, class-variance-authority, clsx, gsap (+25 more)

### Community 64 - "Init flow"
Cohesion: 0.20
Nodes (10): Completion gate, Init flow, Step 1: Load current state, Step 2: Explore the project, Step 3: Interview for product truth, Step 4: Write PRODUCT.md, Step 5: Record workflow defaults, Step 6: Wrap up or resume (+2 more)

### Community 65 - "Generate Combined Critique Report"
Cohesion: 0.20
Nodes (10): Design Health Score, Design Specificity Verdict, Generate Combined Critique Report, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+2 more)

### Community 66 - "initPageChat"
Cohesion: 0.07
Nodes (57): agentHasWorkInFlight(), armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer() (+49 more)

### Community 67 - "Panduan Kelola Galeri Prestasi"
Cohesion: 0.20
Nodes (9): Cara Menambah Galeri di Production, Error yang Sudah Diperbaiki, File Structure, Masalah di Vercel Production, Opsi 1: Upload Manual ke Folder Public (Recommended), Opsi 2: Gunakan External Storage (Future Implementation), Panduan Kelola Galeri Prestasi, Solusi untuk Menambah Galeri (+1 more)

### Community 68 - "content/page.jsx"
Cohesion: 0.07
Nodes (26): BC_FIELDS, BeasiswaEditor(), BootcampEditor(), ContentManagement(), EMPTY_JOB, FAQ_PERSONA_KEYS, FaqEditor(), faqSlug() (+18 more)

### Community 69 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 70 - "Common Cognitive Load Violations"
Cohesion: 0.22
Nodes (9): 1. The Wall of Options, 2. The Memory Bridge, 3. The Hidden Navigation, 4. The Jargon Barrier, 5. The Visual Noise Floor, 6. The Inconsistent Pattern, 7. The Multi-Task Demand, 8. The Context Switch (+1 more)

### Community 71 - "iOS platform"
Cohesion: 0.22
Nodes (9): Color & materials, Components & controls, iOS platform, Layout & structure, Motion, The iOS slop test, Touch targets, Typography (+1 more)

### Community 72 - "impeccable/SKILL.md"
Cohesion: 0.08
Nodes (21): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Craft floor, Refuse, Verify (+13 more)

### Community 73 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 74 - "onAnnotDown"
Cohesion: 0.14
Nodes (22): applyPlaceholderDimensions(), beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay() (+14 more)

### Community 75 - "program-kelas/page.jsx"
Cohesion: 0.07
Nodes (39): Halaman Program Kelas (`/program-kelas`), getData(), metadata, ProgramKelasPage(), revalidate, ClassModal(), pad(), ClassSwitcher() (+31 more)

### Community 76 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 77 - "prestasi-content.js"
Cohesion: 0.13
Nodes (22): Halaman Prestasi (`/achievement`, alias `/prestasi`), Navigasi (berlaku untuk semua halaman), PodiumIllustration(), ACHIEVEMENTS, BANNER_KEY, build(), CATEGORIES, initials() (+14 more)

### Community 78 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 79 - "actOnAgentTarget"
Cohesion: 0.20
Nodes (21): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+13 more)

### Community 80 - "job-board.jsx"
Cohesion: 0.07
Nodes (52): getData(), MagangPage(), metadata, revalidate, ApplicationTracker(), colAt(), SPRING, TrackCard() (+44 more)

### Community 81 - "app/page.jsx"
Cohesion: 0.08
Nodes (29): ref_node_fs, ref_node_path, getData(), metadata, normalizeSrc(), PrestasiPage(), revalidate, getAchievements() (+21 more)

### Community 82 - "konversi-sks/page.jsx"
Cohesion: 0.22
Nodes (9): getData(), KonversiSksPage(), metadata, revalidate, ClaimStepper(), headerOffset(), pad(), KonversiClosing() (+1 more)

### Community 83 - "Cognitive Load Assessment"
Cohesion: 0.29
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 84 - "field-mosaic.jsx"
Cohesion: 0.40
Nodes (5): FROM, sideOf(), SPAN, SURFACE, Tile()

### Community 85 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 86 - "impeccable"
Cohesion: 0.48
Nodes (5): impeccable script, check_download(), fetch_url(), probe_ok(), setup_help()

### Community 87 - "live-browser-ignores.js"
Cohesion: 0.52
Nodes (6): globToRegex(), matchesScope(), normalizeIgnoreRule(), normalizeIgnoreValue(), pageCandidates(), resolveDetectIgnores()

### Community 88 - "curiculum/page.jsx"
Cohesion: 0.13
Nodes (24): getData(), KurikulumPage(), metadata, revalidate, Closing(), ElectiveTracks(), KurikulumHero(), smoothTo() (+16 more)

### Community 89 - "Hero.jsx"
Cohesion: 0.38
Nodes (4): split-type, Hero(), normalizeImagePath(), Play()

### Community 90 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 91 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 92 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 93 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 94 - "resumeSession"
Cohesion: 0.07
Nodes (49): applySavedSessionMeta(), averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), checkpointPayload(), clampVariantIndex(), clearHandled() (+41 more)

### Community 95 - "course-catalog.jsx"
Cohesion: 0.15
Nodes (11): @radix-ui/react-popover, Blank(), ART, CoverArt(), line, seed(), Popover, PopoverAnchor (+3 more)

### Community 96 - "seed-homepage.js"
Cohesion: 0.50
Nodes (4): main(), prisma, { PrismaClient }, seedHomepage()

### Community 97 - "20260205020326_init/migration.sql"
Cohesion: 0.47
Nodes (5): "Achievement", "Alumni", Alumni_nim_key, "User", User_email_key

### Community 98 - "archive.jsx"
Cohesion: 0.11
Nodes (19): StatsDemo(), AnimatedNumber(), AboutScene(), BentoScene(), LECTURERS, Tile(), Archive(), Rows() (+11 more)

### Community 99 - "struktur-organisasi/page.jsx"
Cohesion: 0.09
Nodes (30): getData(), metadata, revalidate, StrukturOrganisasiPage(), Topbar(), Closing(), Avatar(), PersonModalProvider() (+22 more)

### Community 101 - "bootcamp/page.jsx"
Cohesion: 0.06
Nodes (49): BootcampPage(), getData(), metadata, revalidate, BootcampClosing(), BootcampHero(), CountdownPoster(), Digit() (+41 more)

### Community 103 - "Operate"
Cohesion: 0.50
Nodes (3): Comps, Directions, Operate

### Community 104 - "WEB-HIMASISFOR"
Cohesion: 0.40
Nodes (4): Deploy on Vercel, Getting Started, Learn More, WEB-HIMASISFOR

### Community 105 - "charts.jsx"
Cohesion: 0.38
Nodes (9): chart.js, react-chartjs-2, axes(), BarChart(), baseOptions(), DoughnutChart(), LineChart(), useChartTheme() (+1 more)

### Community 106 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 107 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 108 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 109 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 111 - "cn"
Cohesion: 0.05
Nodes (54): MovingBorderButton(), TiltCard(), STAT_DEFS, StatRail(), Body(), EASE, FieldModal(), pad() (+46 more)

### Community 112 - "seed.js"
Cohesion: 0.40
Nodes (3): bcrypt, prisma, { PrismaClient }

### Community 113 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 114 - "faq-content.js"
Cohesion: 0.19
Nodes (11): BANNER_KEY, CARDS, CURTAIN_KEY, DRAWERS, INTRO, mergeFaq(), parse(), PERSONAS (+3 more)

### Community 115 - "letter-form.jsx"
Cohesion: 0.10
Nodes (32): getData(), KontakPage(), metadata, revalidate, AddressMap(), KontakBanner(), Ctx, KontakProvider() (+24 more)

### Community 116 - "build"
Cohesion: 0.50
Nodes (3): build, env, PRISMA_GENERATE_SKIP_AUTOINSTALL

### Community 131 - "layanan-content.js"
Cohesion: 0.06
Nodes (63): fieldLabel(), LayananInbox(), parse(), serviceTitle(), TONE, getData(), LayananAkademikPage(), metadata (+55 more)

### Community 132 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss, @tailwindcss/postcss

### Community 134 - "kurikulum-content.js"
Cohesion: 0.11
Nodes (21): CurriculumManagement(), fetchCurriculum(), defaultElectives(), AdminRpsEditor(), lines(), toGrading(), BANNER_KEY, buildCourse() (+13 more)

### Community 138 - "loader.jsx"
Cohesion: 0.05
Nodes (17): Halaman Login CMS (`/admin/login`), next-auth, metadata, EMPTY, TABS, toLocal(), WartaAdmin(), HelpModal() (+9 more)

### Community 140 - "bidang-keahlian/page.jsx"
Cohesion: 0.10
Nodes (30): BidangKeahlianPage(), getData(), metadata, revalidate, BidangProvider(), Ctx, setHash(), useBidang() (+22 more)

### Community 141 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

### Community 142 - "line-illustrations.jsx"
Cohesion: 0.06
Nodes (52): check(), Beranda Kampus v3 (2026-11 — menggantikan Premium v2), Halaman Beasiswa (`/beasiswa`, alias `/scholarship`, `/kip-kuliah`), Halaman Bidang Keahlian (`/bidang-keahlian`, alias `/peminatan`), Halaman Bootcamp & Course (`/bootcamp`, alias `/course`, `/kursus`, `/studi-independen`), Halaman Dosen (`/dosen`), Halaman FAQ (`/faq`, alias `/tanya`, `/pertanyaan`), Halaman Jalur Kelulusan (`/jalur-kelulusan`, alias `/kelulusan`) (+44 more)

### Community 143 - "site-footer.jsx"
Cohesion: 0.08
Nodes (29): DosenPage(), getData(), metadata, revalidate, FaqPage(), getData(), metadata, revalidate (+21 more)

### Community 144 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 146 - "auth.js"
Cohesion: 0.27
Nodes (6): authConfig, handlers, signIn, signOut, { auth }, config

### Community 147 - "Impeccable Asset Producer"
Cohesion: 0.15
Nodes (11): Act on the receipt, Assemble and review, Plan and asset review, Plan, capture, serve, Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract (+3 more)

### Community 148 - "enableInlineEdit"
Cohesion: 0.40
Nodes (5): collectEditableTextRows(), visit(), enableInlineEdit(), onInlineInput(), wrapMixedContentTextNodes()

### Community 149 - "konversi-content.js"
Cohesion: 0.18
Nodes (12): BANNER_KEY, CAP, CASES, DOCS, INTRO, mergeKonversi(), noticeFromHome(), num() (+4 more)

### Community 150 - "dosen-hero.jsx"
Cohesion: 0.15
Nodes (18): Directory(), LecturerCard(), pad(), Rows(), ViewToggle(), DosenHero(), smoothTo(), Ctx (+10 more)

### Community 152 - "road-hero.jsx"
Cohesion: 0.24
Nodes (9): 6. Build with full commitment, Both paths, Code-led, Comp-led: the comp is a measured contract, ParallaxScene(), box(), pct(), RoadHero() (+1 more)

### Community 153 - "jalur-kelulusan-content.js"
Cohesion: 0.22
Nodes (10): getData(), JalurKelulusanPage(), AGENDA, BANNER_KEY, INTRO, mergeJalur(), nextDefense(), parse() (+2 more)

### Community 155 - "Responsive Design"
Cohesion: 0.20
Nodes (10): Breakpoints: Content-Driven, Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch (+2 more)

### Community 156 - "20261112090000_add_service_request/migration.sql"
Cohesion: 0.52
Nodes (6): "ServiceRequest", ServiceRequest_code_key, ServiceRequest_nim_idx, ServiceRequest_status_idx, "ServiceRequestEvent", ServiceRequestEvent_requestId_idx

### Community 157 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 158 - "berita-seed.js"
Cohesion: 0.20
Nodes (9): ARTICLES, BODIES, CAT(), EXTRA_NEWS, MONTHS, SEED_EVENTS, SEED_POSTS, SUMMARY (+1 more)

### Community 159 - "visi-misi/page.jsx"
Cohesion: 0.16
Nodes (14): getVisiMisi(), metadata, revalidate, VisiMisiPage(), Closing(), MisiModalProvider(), Roadmap(), CURTAIN_KEY (+6 more)

### Community 160 - "New visual work"
Cohesion: 0.20
Nodes (10): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 7. Inspect and finish, Create a whole surface inside an established world, Create or replace the visual world (+2 more)

### Community 162 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 163 - "20261113090000_add_post_event/migration.sql"
Cohesion: 0.48
Nodes (6): "Event", Event_slug_key, Event_status_startAt_idx, "Post", Post_slug_key, Post_type_status_publishedAt_idx

### Community 165 - "noStore"
Cohesion: 0.18
Nodes (20): dynamic, GET(), PENDING, dynamic, PATCH(), dynamic, GET(), DELETE() (+12 more)

### Community 166 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 169 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

## Knowledge Gaps
- **906 isolated node(s):** `prisma`, `$schema`, `style`, `rsc`, `tsx` (+901 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1162 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Flap()` connect `cn` to `prefersReducedMotion`, `startVariantObserver`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `tick()` connect `startVariantObserver` to `live-browser.js`, `connectSSE`, `cn`, `actOnAgentTarget`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `dashboard/page.jsx`, `layanan-content.js`, `Container`, `loader.jsx`, `bidang-keahlian/page.jsx`, `regulasi-akademik/page.jsx`, `line-illustrations.jsx`, `site-footer.jsx`, `prefersReducedMotion`, `berita-content.js`, `modal.jsx`, `dosen-hero.jsx`, `konversi-provider.jsx`, `visi-misi/page.jsx`, `useToast`, `design-system/page.jsx`, `beasiswa-content.js`, `exchange-desk.jsx`, `site-header.jsx`, `react`, `scroll.js`, `agenda-desk.jsx`, `rule-reader.jsx`, `scholarship-modal.jsx`, `find-us.jsx`, `jalur-kelulusan/page.jsx`, `program-kelas/page.jsx`, `job-board.jsx`, `app/page.jsx`, `konversi-sks/page.jsx`, `field-mosaic.jsx`, `curiculum/page.jsx`, `course-catalog.jsx`, `archive.jsx`, `struktur-organisasi/page.jsx`, `bootcamp/page.jsx`, `letter-form.jsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **What connects `prisma`, `$schema`, `style` to the rest of the system?**
  _906 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `live-browser.js` be split into smaller, more focused modules?**
  _Cohesion score 0.02866036925719193 - nodes in this community are weakly interconnected._
- **Should `modern-screenshot.umd.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08897243107769423 - nodes in this community are weakly interconnected._
- **Should `[slug]/page.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058001397624039136 - nodes in this community are weakly interconnected._