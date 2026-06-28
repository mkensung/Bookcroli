# 🎨 ScriptArea UI Taste & Hierarchy Principles

**[FOR AI AGENTS]** When constructing UI, apply these strict UX/UI principles:

## 1. Visual Hierarchy (Size & Weight)
* **Primary Elements (What matters most):** Page Titles and Main CTA buttons MUST be prominent. Use `text-xl` or `text-2xl` with `font-bold` for titles.
* **Secondary Elements:** Body text uses standard `text-sm`. 
* **Microcopy & Metadata:** Helper text, timestamps, and subtle hints MUST be smaller (`text-xs`) and use `var(--text-light)` or `var(--text-dark-gray)`. Never let metadata compete visually with primary text.

## 2. Spacing Consistency (HeroUI Law)
* Maintain absolute rhythm. If a card uses `p-5`, ALL equivalent cards must use `p-5`.
* Group related elements tightly (`gap-2` or `gap-3`). Push unrelated sections apart (`gap-6` or `gap-8`).

## 3. The "No-Distraction" Rule
* Avoid unnecessary borders. Use background surface contrast (e.g., `var(--bg-surface-light)` vs `var(--bg-surface-primary)`) to define boundaries rather than drawing hard lines everywhere.