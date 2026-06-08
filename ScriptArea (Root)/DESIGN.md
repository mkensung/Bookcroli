# 🎨 ScriptArea Design System Architecture (HeroUI Native)

**[FOR AI AGENTS]** The user has officially reset the design system to use **HeroUI's Native OKLCH Theming Engine**. DO NOT use any previously defined custom Hex codes (#F2DCB1, etc.). You must rely entirely on the semantic CSS variables provided by the `theme.css` file and HeroUI's built-in component colors.

---

## 🎨 1. Color Palette & Semantic Tokens
The application now uses a dynamic OKLCH color system injected globally. 
**NEVER hardcode Hex colors.** Use the following semantic variables via Tailwind (e.g., `bg-[var(--accent)]` or if configured in your tailwind config, `bg-accent`):

* **Main Actions & Accents:**
  * `--accent`: Primary brand color for main buttons, active tabs, and highlights.
  * `--accent-foreground`: Text color that goes on top of the accent color.
* **Surfaces & Backgrounds:**
  * `--background`: The absolute main app background.
  * `--surface`: Primary card and container backgrounds.
  * `--surface-foreground`: Text color for surfaces.
  * `--surface-secondary`: Secondary nested containers.
* **Text & Typography:**
  * `--foreground`: Main body text (adapts automatically in dark mode).
  * `--muted`: Subtitles, disabled text, and placeholders.
* **Semantic States:**
  * `--success`, `--warning`, `--danger`, `--default`
* **Form Inputs:**
  * `--field-background`, `--field-border`, `--field-foreground`

---

## 📐 2. Spacing, Bounds, and Layout Constraints
* **Spacing Core (HeroUI Standard):** * Major sections: `gap-6` (24px).
    * Related elements inside cards: `gap-4` (16px).
    * Micro-components: `gap-2` (8px).
* **Border Radii (From Theme Builder):**
    * The user selected `extra-large` for form radius. Rely on the CSS variables `--radius` and `--field-radius` for containers and inputs. Use `rounded-[var(--radius)]` if you need custom divs.

---

## 🧱 3. Component Interactions & Logic (HeroUI Native)

Whenever possible, **use native HeroUI React components** instead of building custom Tailwind HTML divs. 
* Use `<Button color="accent">` instead of `<button className="bg-[var(--accent)]...">`.
* Use HeroUI's native `<Card>`, `<Input>`, `<Tabs>`, etc. The theming engine will automatically apply the correct OKLCH colors, hover states, and focus rings.

### A. Floating Selection Command Box
* **Style:** Build custom floating box using `bg-[var(--surface-secondary)] text-[var(--surface-foreground)] shadow-lg rounded-[var(--radius)]`.

### B. Sidebar Notes Drawer
* **Style:** Background should be `bg-[var(--surface)]`. 
* **Tab Interaction:** Use native HeroUI `<Tabs>` which will automatically pick up the `--accent` color for the indicator.

---
*Acknowledge silently. Discard all previous Hex codes. Rely 100% on HeroUI native components and CSS variables.*