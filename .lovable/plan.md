# Abikarthick G — Recruiter-Optimized Game Dev Portfolio (Revised v4)

Recruiter-first AAA dark sci-fi portfolio. Everything that matters is **above the fold**. Single typed config drives all roles, projects, resumes, and skills.

## Section order

1. Loading Screen — "Initializing Game World…"
2. Sticky Nav — anchors + role-aware **Download Resume**
3. **Role Switcher Bar** — Unity Recruiter · Unreal Recruiter · Gameplay Programmer · Software Engineer Recruiter
4. **Hero (all-in-one above the fold)** — see layout below
5. **Featured Project Spotlight** — single highlighted project directly under hero
6. About
7. Currently Building — 🚧 StarStuff with progress bar
8. **Featured Games** — filter bar + metric-rich cards
9. Game Showcase — itch.io embeds, GIFs/videos, screenshots
10. Skills — chip-only, icon per group
11. Learning Journey
12. Game Development Process
13. GitHub Activity (live from `ABIKARTHICK-412`)
14. Career Interests
15. Contact — form + all resume variants
16. Footer

## New: Hero block (Quick View merged in)

```text
┌───────────────────────────────────────────────┐
│  Crafting Interactive Worlds Through Code     │
│  Unity Developer • Gameplay Programmer        │  ← role-aware subhead
│  [Play My Games] [Download Resume] [Contact]  │
│  ───────────────────────────────────────────  │
│  🎮 3+ Games  🏆 Game Jam  ⚡ Unity & C#       │
│  🚧 Building StarStuff                        │  ← highlights strip
│  ───────────────────────────────────────────  │
│  Experience 1.5+ yrs · Projects 3+ ·          │
│  Primary Engine Unity · Languages C#/C++/Java │
│  Location Tamil Nadu · Open to Internship     │  ← quick view inline
└───────────────────────────────────────────────┘
```

One Hero component renders all three bands so nothing important requires scrolling. Subtle 3D/particles background only behind the headline band; reduced-motion turns it off.

## New: Featured Project Spotlight (under hero)

A dedicated band that pulls one project flagged `featured: true` from config:

```text
CURRENT FEATURED PROJECT
Charge Collector — 3D Endless Runner
Created for SCORE SPACE JAM #33
[Play Now (itch.io)]  [View Project]
```

Config field: `featuredProjectId: "charge-collector"`. Role switcher can override per viewer via `featuredProjectId` inside `viewerRoles[].overrides`. Recruiters get an instant try-it CTA before scrolling.

## New: `projectImpact` on every project

```text
projectImpact: {
  problem:  "Create an endless runner with increasing difficulty.",
  solution: "Implemented procedural obstacle spawning and score-based progression."
}
```

Rendered:
- On the **project card** as a compact "Problem → Solution" two-line block (collapsible on mobile).
- On the **project detail page** as a prominent first section above Technical Challenges.

Recruiters scanning cards see problem-solving framing immediately.

## Featured Games — filter + rich metrics (unchanged from v3)

Filter bar: `All · Unity · Unreal · 2D · 3D · Game Jam · In Development` (Framer Motion `layout` reorder).

Each card:
- Title, category, description
- **projectImpact** (Problem / Solution)
- **Metrics**: Type · Platform · Engine · Language · Team Size · Dev Time · Status
- Tech tags + feature chips
- Buttons: Play (itch.io) · GitHub · View Details

Project detail page (`/projects/$id`) adds: Gallery (gameplay/dev/editor/flow), **projectImpact** (top), Technical Challenges, Key Learnings, embedded itch.io iframe.

## Role Switcher (4 viewers)

Persists in `localStorage`. Each viewer in config controls:
- `headline`, `subheadline`
- `skillsPriority[]`, `projectOrder[]`
- `resumeKey` → Unity / Unreal / Gameplay / Software PDF
- `featuredProjectId` (optional override for the Hero Spotlight)
- `ctaEmphasis`

## Resume Variants

`resumes: { unity, unreal, gameplay, software }` — each viewer maps to a `resumeKey`. Nav/Hero Download buttons swap automatically. Contact section lists all four explicitly.

## Skills (future-proof, no levels)

```text
skillGroups: [
  { id, title, icon, items: [{ name }] }
]
```

Groups: Programming, Game Development, Tools, Problem Solving. Lucide icon per group. No bars/percentages anywhere.

## Single config — `src/data/portfolio.ts`

```text
PortfolioConfig {
  profile, resumes, viewerRoles, hero,
  highlights[], quickView, stats[],
  featuredProjectId,                       // hero spotlight target
  currentlyBuilding,
  projectFilters[],
  projects [{
    id, title, category, description,
    featured: boolean,
    tags[], tech[], features[],
    projectImpact { problem, solution },   // NEW, required
    metrics { type, platform, engine, language, teamSize, devTime, status },
    challenges [{ challenge, solution }],
    learnings [string],
    gallery { gameplay[], development[], editor[], flowDiagram? },
    links { itch?, itchEmbedUrl?, github?, details? }
  }],
  showcase, skillGroups, learningJourney,
  process, timeline, careerInterests,
  github { username: "ABIKARTHICK-412" }
}
```

Adding a viewer, resume, project, or skill = single array push. No component changes.

## Tech stack

TanStack Start · React 19 · TypeScript · Tailwind v4 tokens in `src/styles.css` · Framer Motion · GSAP · @react-three/fiber + drei (hero only, viewport- and reduced-motion-gated) · @tsparticles/react · lucide-react · itch.io `<iframe>` embeds · TanStack Query + server fn `src/lib/github.functions.ts` for live GitHub stats.

Routes: `/`, `/projects`, `/projects/$id`, `/about`, `/contact` — each with unique `head()` and canonical; Person JSON-LD in `__root.tsx`.

Mobile-first; lazy-load heavy bits (Three canvas, particles, itch.io iframes, GitHub block) via Suspense skeletons.

## Placeholders (swap later with one config edit each)

- `/public/resume-{unity,unreal,gameplay,software}.pdf`
- `/public/avatar.jpg`
- Project gallery images, itch embed URLs, showcase GIFs/videos
- Quick View values pre-filled with what you provided (Tamil Nadu, India · Open to Internship & Entry-Level)

## Out of scope (default)

- Real backend / DB / auth
- Real email delivery (uses `mailto:`; add Lovable Cloud + Resend if you want real sending)
