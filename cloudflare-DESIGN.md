---
version: alpha
name: Cloudflare
description: "An internet infrastructure platform anchored in Cloudflare's distinctive orange (#F6821F) on a dark navy canvas (#1D1D1F / #0C0D11) for marketing and clean white for the dashboard. The system reads as serious infrastructure with an approachable brand: the orange is warm and human rather than corporate, contrasting with the technical depth of the product. Dashboard typography uses Inter at functional sizes; marketing uses a custom display variant at bold weights. The orange represents speed, fire, and protection — Cloudflare's three core value propositions materialized as a single accent color used across every touchpoint with unwavering consistency."

colors:
  primary: "#F6821F"
  on-primary: "#ffffff"
  primary-hover: "#E5731A"
  secondary: "#FBAD41"
  ink: "#1D1D1D"
  ink-muted: "#6B7280"
  canvas: "#ffffff"
  surface-1: "#F8F8F8"
  surface-2: "#F0F0F0"
  border: "#E2E2E2"
  dark-bg: "#0C0D11"
  dark-surface: "#161821"
  dark-border: "#2A2C38"
  dark-ink: "#E8E8E8"
  success: "#00B520"
  danger: "#FF4040"
  warning: "#F6821F"

typography:
  display:
    fontFamily: "Maison Neue, Inter, -apple-system, sans-serif"
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  body:
    fontFamily: "Maison Neue, Inter, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0

spacing:
  base: 8px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]

radius:
  sm: 4px
  md: 6px
  lg: 12px
  pill: 9999px

shadows:
  card: "0 1px 4px rgba(0,0,0,0.08)"
  elevated: "0 4px 16px rgba(0,0,0,0.12)"

motion:
  duration-fast: 100ms
  duration-base: 200ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)
---

## Rationale

**Orange as speed, fire, and protection** — #F6821F encodes three of Cloudflare's core value propositions into a single color. Warm orange evokes combustion speed (CDN performance), a protective flame (DDoS mitigation), and solar energy (global network reach). No other brand color in infrastructure communicates all three simultaneously with the same efficiency.

**Using orange for warnings, not just alerts** — The dual assignment of orange to both "brand primary" and "warning state" is a clever constraint: it means warnings feel on-brand rather than alarming, which is psychologically appropriate for infrastructure that should feel monitored, not panicked. Red is reserved for actual errors.

**Clean white dashboard, dramatic dark marketing** — The split between light product surfaces and dark marketing pages reflects different audiences. Engineers checking Workers deployments need data clarity; prospective customers need to feel Cloudflare's scale and power. The two registers serve different conversion goals without visual contradiction.

**Minimal radius as infrastructure seriousness** — Cloudflare's 4–6px radius scale is less rounded than consumer products, signaling technical precision rather than consumer friendliness. This is calibrated for an audience of developers and DevOps engineers who associate very rounded UI with consumer apps and sharper edges with professional tools.

**Documentation-first architecture** — The emphasis on code blocks, two-column layouts, and inline links reflects that Cloudflare's product is primarily consumed through documentation and dashboards. Typography and spacing decisions prioritize reading long technical documents over impressing first-time visitors.

## 1. Visual Theme & Atmosphere
Cloudflare sits at an interesting design intersection: infrastructure company with consumer-legible branding. The orange is everywhere — Cloudflare's orange is as distinctive as Stripe's blue or GitHub's dark. The dashboard (Workers, R2, D1, Pages, etc.) uses a clean white product surface where orange appears on the primary "Create" button, active navigation indicators, and status warnings (orange = "check this"). Marketing goes darker and more dramatic. The brand consistently communicates speed and protection through warm, energetic color.

## 2. Color System
- **Orange**: #F6821F — the singular brand color; used for primary CTAs, active states, and the logo across all contexts
- **Secondary amber**: #FBAD41 — lighter orange for gradient partner and decorative accents
- **Dark marketing**: #0C0D11 — very dark navy-black for dramatic marketing surfaces
- **Dashboard canvas**: White with very light gray surfaces — enterprise clarity
- **Warning**: Cloudflare uses orange for warnings (matches brand) — a clever dual-use of the primary color
- **Danger**: Red #FF4040 only for errors, keeping orange non-alarming

## 3. Typography
Maison Neue (or Inter equivalent) — humanist grotesque at bold display weights for marketing. Dashboard uses Inter at smaller functional sizes. The documentation is extensive and uses a three-level hierarchy (H1/H2/H3) with monospace code blocks throughout.

## 4. Components & Patterns
- **Dashboard nav**: Left sidebar with product areas (Workers, Pages, D1, etc.), orange active indicator
- **Worker editor**: Code editor (Monaco-based), route configuration panel, logs panel
- **Analytics charts**: Traffic volume over time, geographic heatmap, orange-accented data points
- **Status badge**: Healthy (green) / Degraded (orange) / Error (red) — Cloudflare's three states
- **Zone selector**: Top-of-page domain switcher dropdown
- **Documentation**: Two-column layout with code examples, orange inline links

## 5. Spacing & Layout
Dashboard: 220px sidebar + content area, max 1200px. Workers editor: split-pane code/preview. Marketing: 1440px max, dramatic full-bleed sections with orange gradient moments.

## 6. Motion & Interaction
Dashboard is functional and fast — hover highlights, no animation. Worker logs stream in real-time. Deployments show progress with animated status. Marketing has scroll-triggered reveals. Overall: reliable infrastructure aesthetic, not flashy.

## Accessibility

### Contrast Ratios
- **Primary on background** (#F6821F on #FFFFFF): 2.6:1 — decorative only
- **Text on background** (#1D1D1D on #FFFFFF): 16.9:1 — passes AA, passes AAA
- **Muted on background** (#6B7280 on #FFFFFF): 4.8:1 — passes AA, fails AAA

### Minimum Requirements
- **Touch target**: 44×44px minimum for all interactive elements
- **Focus indicator**: #F6821F outline, 2px, 2px offset
- **Focus contrast**: 2.6:1 against #FFFFFF background

### Motion
- Respects `prefers-reduced-motion`: yes — all transitions and animations should be suppressed
- All transitions use `@media (prefers-reduced-motion: reduce)` guard

### Notes
- The orange primary #F6821F has only 2.6:1 contrast against white — it must not be used as text color or a sole interactive indicator on white backgrounds; restrict it to large decorative elements, icon fills, and brand moments.
- Focus rings using the orange on white are below the 3:1 minimum for UI components; supplement with a dark offset shadow (e.g. `0 0 0 2px #1D1D1D`) to make focus perceivable.
- On the dark navy marketing canvas, the orange reverses well — verify the ratio against the specific dark surface value used rather than assuming white-page values apply.
- Worker log streaming and deployment progress animations should be suppressed under `prefers-reduced-motion`; show static state instead.
