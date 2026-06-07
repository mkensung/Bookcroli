# 🎨 ScriptArea Design System Architecture & Engineering Blueprint

**[FOR AI AGENTS]** This is the definitive visual source of truth for the ScriptArea workspace. The design strictly utilizes a custom premium "Warm & Earthy Editorial" aesthetic. You MUST generate UI components, layouts, surfaces, typography, and borders strictly following the analyzed tokens, hex values, and constraints below. **DO NOT use default Tailwind color configurations.**

---

## 🎨 1. Visual Theme & Atmosphere
* **The Vibe:** Elegant, book-inspired, and highly pragmatic. The interface must feel like an premium editorial platform or high-end book reading space blended seamlessly with tactical workspace features.
* **Chrome Style:** Soft yet crisp layouts. Elements are structured neatly based on clean alignments with comfortable padding scale matching HeroUI design paradigms.

---

## 🎨 2. Color Palette & Variable Roles

All user interface styling, surface backgrounds, component fills, text tokens, and outlines must map strictly to these custom CSS variables. Do not inject unauthorized shades.

```css
:root {
  /* 🟡 MAIN / PRIMARY (Interactive Accent) */
  --color-primary-default:      #F2DCB1; /* Main primary theme color for major accents and actions */
  --color-primary-hover:        #FFEBC5; /* Light hover highlight state for primary elements */
  --color-primary-surface:      #F2DCB1; /* Flat surface fill for branding targets */

  /* 🟠 MAIN / SECONDARY (Action Accent) */
  --color-secondary-default:    #E8A562; /* Focused secondary interactive actions & badges */
  --color-secondary-hover:      #FFE4C9; /* Warm hover state for secondary components */

  /* 📜 MAIN / SURFACE (Surfaces & Background Canvas) */
  --bg-surface-primary:         #F5F3ED; /* Global application backdrop (Soft Warm Cream) */
  --bg-surface-light:           #FFFCF3; /* Elevated cards, sidebar panels, and dialog canvases */
  --bg-surface-lighter:         #FFFCF3; /* Inner interactive block surfaces */
  --bg-surface-background:      #FFFFFF; /* Contrast clean background panels */

  /* 🔲 MAIN / OUTLINE (Borders & Structural Separators) */
  --border-outline-primary:     #F2DCB1; /* Accent container outlines */
  --border-outline-default:     #F5F3ED; /* Invisible low-contrast dividers */
  --border-outline-darker:      #BEB8A8; /* High-contrast borders for focused input frames */
  --border-outline-light:       #D7D1C0; /* Standard thin component outlines */

  /* 🖋️ MAIN / DESCRIPTIVE-TEXT (Editorial Typography) */
  --text-normal:                 #392A1B; /* Primary ink - Deep velvet brown for headers & readable text */
  --text-secondary:              #9F7B56; /* Accent medium brown for subtexts & labels */
  --text-dark-gray:              #67645B; /* Neutral dim slate-brown for technical metadata */
  --text-light:                  #A29D8F; /* Placeholders, disabled actions, and inactive markers */

  /* 🚥 MAIN / SEMANTIC STATUS FEEDBACK */
  /* Success State */
  --status-success-default:     #6EDA96;
  --status-success-hover:       #ECFFED;
  --status-success-surface:     #F1FFF6;
  /* Error / Destructive State */
  --status-error-default:       #FA7676;
  --status-error-hover:         #FFE8E8;
  --status-error-surface:       #FFF4F4;
  /* Warning State */
  --status-warning-default:     #FFC376;
  --status-warning-hover:       #FFF4E6;
  --status-warning-surface:     #FFFBF5;
  /* Info State */
  --status-info-default:        #6EB2FF;
  --status-info-hover:          #E7F2FF;
  --status-info-surface:        #F6FAFF;
}

📐 3. Spacing, Bounds, and Layout Layout Constraints
Layout Grid Scale: Core layout wrappers, gap sizes, and padding scales must align completely with the HeroUI standard configuration scale.

Major layout segments / panel groups: gap-6 (24px spacing matrix).

Embedded elements inside dynamic containers: gap-4 (16px spacing matrix).

Micro elements (icon label bindings): gap-2 (8px spacing matrix).

Padding Constants:

Main ScriptArea Application Frame: p-8 for premium breathing space and clean typography layout.

Internal content lists, side drawers, and item rows: Standardized at p-5 or p-6.

Border Radii (Curvature Tokens):

Core Content Wrappers: rounded-2xl (16px smooth radius).

Operational Components (Buttons, Input Fields, Modals): rounded-xl (12px radius) matching HeroUI aesthetics perfectly.

🔤 4. Typography Rules & Strict Exceptions
Global UI Font Family: Standard System Sans-serif conforming to default HeroUI definitions (Inter, SF Pro typography metrics). Font colors MUST default to var(--text-normal) instead of solid pure black.

⚠️ STRICT SPLIT-SCREEN EXCEPTION: The main split-screen workspace (Translation Windows) operates under a specialized typographic density grid. AI Agents MUST NOT change, refactor, or overlay custom font families, letter-spacing, or leading properties on the split panels. This zone is strictly locked to prevent responsive reading breaks.

Dynamic Drawer Scaling: The typography inside the notebook drawer scales fluidly based on the properties tab. Use geometric font-sans for Scratchpad logs and precise font-mono for structural Vocabulary targets.

🧱 5. Component Specifications & Interaction Mechanics
A. Action Buttons
Primary Interactive Actions: Built with bg-[var(--color-primary-default)] text-[var(--text-normal)] font-semibold. Hovering elements triggers a transition to bg-[var(--color-primary-hover)].

Secondary / Special Actions: Built with bg-[var(--color-secondary-default)] text-[#FFFFFF] font-semibold. Hovering transitions to bg-[var(--color-secondary-hover)] text-[var(--text-normal)].

Ghost / Outline Controls: Transparent canvas bound with 1px border-[var(--border-outline-light)] text-[var(--text-normal)]. Hovering shifts background safely to bg-[var(--bg-surface-light)].

Motion Interpolation: All micro-interactions, scale triggers, and ring focuses must strictly follow HeroUI standard transition physics for visual consistency.

B. Floating Selection Command Box
Trigger Constraint: Launches exclusively on a clean browser text highlight range (0 < length < 50 characters).

Styling Blueprint: Premium matte floating command strip: bg-[var(--text-normal)] text-[var(--bg-surface-primary)] shadow-2xl rounded-xl border border-[var(--border-outline-light)].

Layer Model: Centered absolutely using fixed z-50 parameters directly matching mouse boundary markers. Bound with stop propagation methods to secure persistent highlights.

C. Notebook Drawer Layer (app/components/NotesDrawer.tsx)
Layer Logic: Fully isolated and decoupling content layers. Follows explicit HeroUI animation presets (slide-in-from-right).

Visual Styling: Backdrops must utilize bg-[var(--text-normal)]/20 backdrop-blur-sm. Inner layout elements transition cleanly into warm surfaces using --border-outline-light dividers.

Tab Interaction Underlines: Displays fluid sliding underline accent tracks utilizing --color-secondary-default bounding indicators mapped directly to active state controls.

Tactile Empty States: If dynamic states (e.g., vocabulary counts) register at zero (0 items), remove plain views immediately. Render a beautiful center-aligned block framework (flex flex-col items-center justify-center text-center py-12 bg-[var(--bg-surface-primary)] rounded-xl), leveraging minimalist icons styled in text-[var(--text-light)].

🛑 6. Do's and Don'ts
Do:
Always derive semantic styling from the variable codes mapped in Section 2.

Protect and maintain the locked split-screen typography grid during feature integrations.

Utilize deep brown ink var(--text-normal) as the absolute text default to guarantee reading optimization.

Don't:
Never deploy default high-contrast grays (text-slate-900, bg-gray-100) inside the warm workspace environment.

Never wrap inputs or checkboxes in full pill curvatures — keep design tokens balanced to uniform rounded-xl boundaries.

Never mutate or alter pre-existing component parameters outside the explicitly assigned scope of changes.

Acknowledge silently and maintain total design accuracy throughout the modification cycle.