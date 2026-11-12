# Graph Report - Web Sisfor  (2026-11-12)

## Corpus Check
- 449 files · ~2,301,694 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, .css 3, .cmd 1)

## Summary
- 2894 nodes · 7895 edges · 148 communities (120 shown, 28 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `487b3734`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- live-browser.js
- modern-screenshot.umd.js
- magang/page.jsx
- bidang-keahlian/page.jsx
- [slug]/page.jsx
- magang-content.js
- shared.jsx
- 🚀 Panduan Deploy ke Vercel dengan Database
- package.json
- createLiveBrowserDomHelpers
- What You Must Do When Invoked
- CMS Kurikulum - Dokumentasi
- Ringkasan Optimasi yang Telah Dilakukan
- rule-simulator.jsx
- live.md
- new-work.md
- onboard.md
- study-map.jsx
- The Toolkit
- job-board.jsx
- next
- Simplify the Design
- prefersReducedMotion
- polish.md
- Responsive Design
- createLiveBrowserSessionState
- components.json
- auth.js
- connectSSE
- handleManualEditActivity
- initGlobalBar
- startVariantObserver
- archive.jsx
- animate.md
- Handle `generate`
- scripts
- Generate Report
- jalur-kelulusan/page.jsx
- optimize.md
- cn
- el
- colorize.md
- profil-lulusan/page.jsx
- eslint.config.mjs
- site-header.jsx
- program-kelas/page.jsx
- build.py
- @prisma/client
- critique.md
- visi-misi/page.jsx
- konversi-content.js
- dosen/page.jsx
- injectSvelteComponentsFromManifest
- clarify.md
- Nielsen's 10 Heuristics
- document.md
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- quieter.md
- Testimoni.jsx
- curriculum/page.jsx
- Web Sisfor - Next.js dengan PostgreSQL
- Extract Flow
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
- react
- Android platform
- prestasi-provider.jsx
- Persona-Based Design Testing
- actOnAgentTarget
- Operate mode depth (and Read notes)
- route-story.jsx
- Generate Report
- Cognitive Load Assessment
- downloadIcs
- Impeccable Manual Edit Applier
- impeccable
- live-browser-ignores.js
- curiculum/page.jsx
- Hero.jsx
- graphify reference: query, path, explain
- Diagnostic Scan
- Product
- Visualize: Direction Comps & Asset Production
- resumeSession
- app/page.jsx
- story.jsx
- 20260205020326_init/migration.sql
- aos-provider.jsx
- field-mosaic.jsx
- adapt.md
- exchange-desk.jsx
- line-illustrations.jsx
- WEB-HIMASISFOR
- charts.jsx
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Heuristics Scoring Guide
- Beranda Kampus v3 (2026-11 — menggantikan Premium v2)
- motion.js
- KnowledgeImg.jsx
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
- New visual work
- { GET, POST }
- devDependencies
- PageLoader
- Beranda — si.uisi.ac.id
- jalur-kelulusan-content.js
- useToast
- Impeccable Finish Reviewer
- bolder.md
- enableInlineEdit
- Persuade and Experience
- Design System — Sisfor UISI
- ref_field_modal
- prisma.js
- Operate

## God Nodes (most connected - your core abstractions)
1. `cn()` - 278 edges
2. `react` - 157 edges
3. `prefersReducedMotion()` - 149 edges
4. `Container()` - 85 edges
5. `next` - 76 edges
6. `PlaceholderTag()` - 63 edges
7. `LottieIllustration()` - 46 edges
8. `useToast()` - 44 edges
9. `SectionHeader()` - 37 edges
10. `connectSSE()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Step 1: Run the pass` --references--> `path()`  [INFERRED]
  .claude/skills/impeccable/reference/doctor.md → scripts/lottie/build.py
- `Write the config` --references--> `path()`  [INFERRED]
  .claude/skills/impeccable/reference/live-setup.md → scripts/lottie/build.py
- `Halaman Sambutan Kaprodi (`/sambutan-kaprodi`)` --references--> `PlaceholderTag()`  [INFERRED]
  DESIGN.md → src/components/home/shared.jsx
- `Navigasi (berlaku untuk semua halaman)` --references--> `SiteHeader()`  [INFERRED]
  DESIGN.md → src/components/home/site-header.jsx
- `Halaman Profil Lulusan (`/profil-lulusan`)` --references--> `GraduatePathIllustration()`  [INFERRED]
  DESIGN.md → src/components/illustrations/line-illustrations.jsx

## Import Cycles
- 3-file cycle: `src/components/regulasi/doc-modal.jsx -> src/components/regulasi/doc-shelf.jsx -> src/components/regulasi/regulasi-provider.jsx -> src/components/regulasi/doc-modal.jsx`
- 4-file cycle: `src/components/regulasi/doc-modal.jsx -> src/components/regulasi/doc-shelf.jsx -> src/components/regulasi/regulasi-banner.jsx -> src/components/regulasi/regulasi-provider.jsx -> src/components/regulasi/doc-modal.jsx`

## Communities (148 total, 28 thin omitted)

### Community 0 - "live-browser.js"
Cohesion: 0.03
Nodes (136): addManualContextText(), applyGlobalBarLabelState(), applyLiveBarPreference(), applyPlaceholderSizingStyles(), bindEditBadgeProxy(), bufferToBase64(), buildCollapsible(), buildColorModels() (+128 more)

### Community 1 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 2 - "magang/page.jsx"
Cohesion: 0.09
Nodes (29): getData(), MagangPage(), metadata, revalidate, getData(), metadata, RegulasiAkademikPage(), revalidate (+21 more)

### Community 3 - "bidang-keahlian/page.jsx"
Cohesion: 0.12
Nodes (20): BidangKeahlianPage(), getData(), metadata, revalidate, BidangProvider(), setHash(), AosReady(), AXES (+12 more)

### Community 4 - "[slug]/page.jsx"
Cohesion: 0.06
Nodes (25): Profile(), DynamicPage(), generateMetadata(), getPageData(), renderSection(), CareerSection(), Footer(), InfiniteAlumni() (+17 more)

### Community 5 - "magang-content.js"
Cohesion: 0.11
Nodes (22): MagangProvider(), setHash(), BANNER_KEY, CURTAIN_KEY, daysLeft(), DOCS, FIELDS, infoSession() (+14 more)

### Community 6 - "shared.jsx"
Cohesion: 0.06
Nodes (53): NEXT, WAYS, AboutScene(), LEFT, RIGHT, ElvoPeek(), W, ArrowLink() (+45 more)

### Community 7 - "🚀 Panduan Deploy ke Vercel dengan Database"
Cohesion: 0.06
Nodes (32): 1. Push Code ke GitHub, Build Error: "prisma:client" not found, 🌐 Deploy ke Vercel, Error: "Can't reach database server", Error: "Error: P1001", Error: "Error: P3009", Error: "PrismaClient is unable to run in this browser environment", Jika pakai database eksternal (Neon/Supabase/Railway): (+24 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): name, private, version, clsx, eslint, eslint-config-next, gsap, @gsap/react (+16 more)

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

### Community 13 - "rule-simulator.jsx"
Cohesion: 0.12
Nodes (22): dec(), Lever(), RollNumber(), RuleSimulator(), BANNER_KEY, byKey(), CHAPTERS, DOCS (+14 more)

### Community 14 - "live.md"
Cohesion: 0.07
Nodes (26): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, Cleanup, Exit, First-time setup, Handle `accept` (+18 more)

### Community 15 - "new-work.md"
Cohesion: 0.06
Nodes (29): Recommended Actions, Craft (deprecated alias), Impeccable Documenter, Input Contract, Output Contract, Workflow, Monorepo notes, Opting out of the boot check (+21 more)

### Community 16 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 17 - "study-map.jsx"
Cohesion: 0.16
Nodes (16): ElectiveTracks(), Ctx, KurikulumProvider(), setHash(), useKurikulum(), RpsDrawer(), RumpunDot(), STYLE (+8 more)

### Community 18 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 19 - "job-board.jsx"
Cohesion: 0.12
Nodes (28): ApplicationTracker(), colAt(), SPRING, TrackCard(), DocModal(), ChipGroup(), DeadlineChip(), fieldLabel() (+20 more)

### Community 20 - "next"
Cohesion: 0.10
Nodes (33): lucide-react, next, LECTURERS, PlaceholderTag(), VideoCard(), CourseSearch(), Mark(), norm() (+25 more)

### Community 21 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 22 - "prefersReducedMotion"
Cohesion: 0.07
Nodes (41): animejs, StatsDemo(), AccreditationScene(), BentoScene(), Tile(), WhyScene(), ILLUSTRATIONS, ScrubField() (+33 more)

### Community 23 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 24 - "Responsive Design"
Cohesion: 0.06
Nodes (30): Breakpoints: Content-Driven, Content Adaptation, Detect Input Method, Not Just Screen Size, Implement Adaptations, Layout Adaptation Patterns, Layout Adaptation Techniques, Mobile-First: Write It Right, Navigation Adaptation (+22 more)

### Community 25 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 26 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 27 - "auth.js"
Cohesion: 0.23
Nodes (8): next-auth, auth, authConfig, handlers, signIn, signOut, { auth }, config

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

### Community 32 - "archive.jsx"
Cohesion: 0.19
Nodes (11): Archive(), Rows(), Segmented(), FeatureCard(), Featured(), pad(), LevelBadge(), usePrestasi() (+3 more)

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

### Community 37 - "jalur-kelulusan/page.jsx"
Cohesion: 0.25
Nodes (8): getData(), JalurKelulusanPage(), metadata, revalidate, JalurClosing(), JalurProvider(), setHash(), TradeoffCards()

### Community 38 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 39 - "cn"
Cohesion: 0.06
Nodes (51): class-variance-authority, swiper, LoginPage(), SWATCHES, BackgroundPaths(), MovingBorderButton(), Spotlight(), TiltCard() (+43 more)

### Community 40 - "el"
Cohesion: 0.09
Nodes (46): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+38 more)

### Community 41 - "colorize.md"
Cohesion: 0.25
Nodes (7): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode

### Community 42 - "profil-lulusan/page.jsx"
Cohesion: 0.20
Nodes (10): getData(), metadata, ProfilLulusanPage(), revalidate, AlumniCard(), AlumniWall(), initials(), Closing() (+2 more)

### Community 43 - "eslint.config.mjs"
Cohesion: 0.14
Nodes (8): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc, ref_fs, ref_path, ref_url

### Community 44 - "site-header.jsx"
Cohesion: 0.08
Nodes (33): ArrowUpGlyph(), base, ChevronGlyph(), CloseGlyph(), MenuGlyph(), SOCIAL_ICON, activeMenu(), Mega() (+25 more)

### Community 45 - "program-kelas/page.jsx"
Cohesion: 0.13
Nodes (17): getData(), metadata, ProgramKelasPage(), revalidate, KelasProvider(), setHash(), BANNER_KEY, CLASSES (+9 more)

### Community 46 - "build.py"
Cohesion: 0.13
Nodes (68): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, PowerShell 5.1: Vertical scrolling stops working (+60 more)

### Community 47 - "@prisma/client"
Cohesion: 0.06
Nodes (20): prisma, bcrypt, prisma, { PrismaClient }, bcrypt, prisma, { PrismaClient }, main() (+12 more)

### Community 48 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 49 - "visi-misi/page.jsx"
Cohesion: 0.16
Nodes (14): getVisiMisi(), metadata, revalidate, VisiMisiPage(), Closing(), MisiModalProvider(), Roadmap(), CURTAIN_KEY (+6 more)

### Community 50 - "konversi-content.js"
Cohesion: 0.14
Nodes (15): NEWS, BANNER_KEY, CAP, CASES, CURTAIN_KEY, DOCS, INTRO, LIMITS (+7 more)

### Community 51 - "dosen/page.jsx"
Cohesion: 0.07
Nodes (43): DosenPage(), getData(), metadata, revalidate, Closing(), Directory(), LecturerCard(), pad() (+35 more)

### Community 52 - "injectSvelteComponentsFromManifest"
Cohesion: 0.06
Nodes (52): acceptedDomAlreadyClean(), applyOriginalAttrsToSvelteAnchor(), buildSvelteExpressionTextMap(), buildSveltePropValuesFromLiveElement(), buildSveltePropValuesV2(), clearHandledWrapperReloadStamp(), cloneWithoutElements(), collectTextNodes() (+44 more)

### Community 53 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 54 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 55 - "document.md"
Cohesion: 0.17
Nodes (11): Pitfalls, Seed mode, Step 1: Route through new-work's workshop, Step 2: Write seed DESIGN.md, Step 3: Confirm, Style guidelines, The frontmatter: token schema, The markdown body: eight sections (canonical order) (+3 more)

### Community 56 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.15
Nodes (13): Component translation rules, Narrative mapping, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Step 1: Find the design assets, Step 2: Auto-extract what can be auto-extracted, Step 2b: Stage the frontmatter, Step 3: Ask the user for qualitative language (+5 more)

### Community 57 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 59 - "curriculum/page.jsx"
Cohesion: 0.27
Nodes (7): CurriculumManagement(), fetchCurriculum(), defaultElectives(), AdminRpsEditor(), lines(), toGrading(), ELECTIVES

### Community 60 - "Web Sisfor - Next.js dengan PostgreSQL"
Cohesion: 0.18
Nodes (10): 1. Konfigurasi Database, 2. Generate Prisma Client, 3. Migrasi Database, 4. Prisma Studio (GUI Database), API Endpoints, Cara Menggunakan, Database Schema, Setup Database PostgreSQL (+2 more)

### Community 61 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 62 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, animejs, aos, bcryptjs, chart.js, class-variance-authority, clsx, gsap (+24 more)

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
Cohesion: 0.11
Nodes (11): ContentManagement(), EMPTY_JOB, KonversiEditor(), MAGANG_DOCS, MAGANG_FIELDS, MAGANG_MODES, MAGANG_PROGRAMS, MagangEditor() (+3 more)

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
Cohesion: 0.10
Nodes (16): Craft floor, Refuse, Verify, Constraints, Failure modes, Flow, /impeccable hooks, Routing (+8 more)

### Community 73 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 74 - "onAnnotDown"
Cohesion: 0.14
Nodes (22): applyPlaceholderDimensions(), beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay() (+14 more)

### Community 75 - "react"
Cohesion: 0.08
Nodes (15): react, SpotlightCard(), ViewToggle(), PARTS, Minilab(), Conn(), PersonCard(), Avatar() (+7 more)

### Community 76 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 77 - "prestasi-provider.jsx"
Cohesion: 0.36
Nodes (7): AchieverModal(), Ctx, Highlight(), norm(), PAGE, PrestasiProvider(), setHash()

### Community 78 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 79 - "actOnAgentTarget"
Cohesion: 0.20
Nodes (21): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+13 more)

### Community 80 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 81 - "route-story.jsx"
Cohesion: 0.14
Nodes (20): @radix-ui/react-dialog, JalurBanner(), Ctx, smoothTo(), useJalur(), EASE, pad(), PathModal() (+12 more)

### Community 82 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 83 - "Cognitive Load Assessment"
Cohesion: 0.29
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 84 - "downloadIcs"
Cohesion: 0.60
Nodes (4): downloadIcs(), eventDate(), MONTHS, stamp()

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
Cohesion: 0.09
Nodes (27): getData(), KurikulumPage(), metadata, revalidate, getData(), KonversiSksPage(), metadata, revalidate (+19 more)

### Community 89 - "Hero.jsx"
Cohesion: 0.38
Nodes (4): split-type, Hero(), normalizeImagePath(), Play()

### Community 90 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 91 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 92 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 93 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 94 - "resumeSession"
Cohesion: 0.07
Nodes (49): applySavedSessionMeta(), averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), checkpointPayload(), clampVariantIndex(), clearHandled() (+41 more)

### Community 95 - "app/page.jsx"
Cohesion: 0.10
Nodes (23): ref_node_fs, ref_node_path, getData(), metadata, normalizeSrc(), PrestasiPage(), revalidate, getAchievements() (+15 more)

### Community 96 - "story.jsx"
Cohesion: 0.05
Nodes (36): ElvoSays(), ParallaxScene(), ACH_ICONS, WHY_ICONS, ACHIEVEMENTS, ALUMNI, ELVO_LINES, EXPERTISE (+28 more)

### Community 97 - "20260205020326_init/migration.sql"
Cohesion: 0.47
Nodes (5): "Achievement", "Alumni", Alumni_nim_key, "User", User_email_key

### Community 98 - "aos-provider.jsx"
Cohesion: 0.18
Nodes (9): aos, src_app_globals, bricolage, inter, metadata, notoSerif, AosProvider(), Providers() (+1 more)

### Community 99 - "field-mosaic.jsx"
Cohesion: 0.13
Nodes (18): BidangBanner(), BidangHero(), smoothTo(), Ctx, useBidang(), CaseLens(), SURFACE, Body() (+10 more)

### Community 100 - "adapt.md"
Cohesion: 0.11
Nodes (16): Assess Adaptation Challenge, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Mobile Adaptation (Desktop → Mobile), Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables (+8 more)

### Community 101 - "exchange-desk.jsx"
Cohesion: 0.12
Nodes (25): motion, SectionHeader(), ClaimStepper(), pad(), StepBody(), CourseModal(), Inputs(), MobileDock() (+17 more)

### Community 103 - "line-illustrations.jsx"
Cohesion: 0.13
Nodes (9): accent, CompassQuadrantIllustration(), gearTeeth(), GraduatePathIllustration(), KnowledgeIllustration(), line, node, RulebookIllustration() (+1 more)

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

### Community 110 - "Beranda Kampus v3 (2026-11 — menggantikan Premium v2)"
Cohesion: 0.08
Nodes (28): check(), Beranda Kampus v3 (2026-11 — menggantikan Premium v2), Halaman Bidang Keahlian (`/bidang-keahlian`, alias `/peminatan`), Halaman Dosen (`/dosen`), Halaman Konversi SKS (`/konversi-sks`, alias `/konversi`, `/mbkm`), Halaman Kurikulum & RPS (`/curiculum`, alias `/kurikulum`), Halaman Magang (`/magang`, alias `/internship`, `/kerja-praktik`), Halaman Prestasi (`/achievement`, alias `/prestasi`) (+20 more)

### Community 112 - "motion.js"
Cohesion: 0.09
Nodes (27): Halaman Profil Lulusan (`/profil-lulusan`), Card(), Cylinder(), HeroScene(), VideoButton(), IntroLoader(), markDone(), useIntroReady() (+19 more)

### Community 116 - "build"
Cohesion: 0.50
Nodes (3): build, env, PRISMA_GENERATE_SKIP_AUTOINSTALL

### Community 129 - "New visual work"
Cohesion: 0.06
Nodes (32): Act on the receipt, Assemble and review, Plan and asset review, Plan, capture, serve, Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract (+24 more)

### Community 132 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss, @tailwindcss/postcss

### Community 140 - "jalur-kelulusan-content.js"
Cohesion: 0.20
Nodes (11): Halaman Jalur Kelulusan (`/jalur-kelulusan`, alias `/kelulusan`), GraduationForkIllustration(), AGENDA, BANNER_KEY, CURTAIN_KEY, INTRO, mergeJalur(), nextDefense() (+3 more)

### Community 141 - "useToast"
Cohesion: 0.07
Nodes (39): Aturan pakai, Halaman Regulasi Akademik (`/regulasi-akademik`, alias `/regulasi`), DesignSystemPage(), angleOf(), InterestRadar(), poly(), pt(), STROKE (+31 more)

### Community 144 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 147 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 148 - "enableInlineEdit"
Cohesion: 0.40
Nodes (5): collectEditableTextRows(), visit(), enableInlineEdit(), onInlineInput(), wrapMixedContentTextNodes()

### Community 151 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

### Community 152 - "Design System — Sisfor UISI"
Cohesion: 0.40
Nodes (4): Auth.js, Design System — Sisfor UISI, Stack, Token

### Community 159 - "Operate"
Cohesion: 0.50
Nodes (3): Comps, Directions, Operate

## Knowledge Gaps
- **813 isolated node(s):** `prisma`, `$schema`, `style`, `rsc`, `tsx` (+808 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1030 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Flap()` connect `prefersReducedMotion` to `cn`, `startVariantObserver`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `tick()` connect `startVariantObserver` to `live-browser.js`, `connectSSE`, `prefersReducedMotion`, `actOnAgentTarget`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `shared.jsx`, `useToast`, `rule-simulator.jsx`, `study-map.jsx`, `job-board.jsx`, `next`, `prefersReducedMotion`, `archive.jsx`, `profil-lulusan/page.jsx`, `site-header.jsx`, `visi-misi/page.jsx`, `dosen/page.jsx`, `react`, `prestasi-provider.jsx`, `route-story.jsx`, `curiculum/page.jsx`, `story.jsx`, `field-mosaic.jsx`, `exchange-desk.jsx`, `motion.js`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **What connects `prisma`, `$schema`, `style` to the rest of the system?**
  _813 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `live-browser.js` be split into smaller, more focused modules?**
  _Cohesion score 0.02866036925719193 - nodes in this community are weakly interconnected._
- **Should `modern-screenshot.umd.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08897243107769423 - nodes in this community are weakly interconnected._
- **Should `magang/page.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0873015873015873 - nodes in this community are weakly interconnected._