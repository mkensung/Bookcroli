# 🤖 AI Developer Guidelines & Project Rules (ScriptArea)

**[CRITICAL INSTRUCTION]**
You MUST adhere to these absolute rules. Violation is strictly prohibited.

## 🏗️ 1. Framework & Core Dependencies
* **Primary Framework:** Strictly use **HeroUI v.3 (latest)**.
* **Exception:** Use `framer-motion` ONLY for complex animations if HeroUI bugs out. Request permission before adding new packages.

## 🧠 2. Safe Integration & Scope Control
* **Laser Focus:** Modify ONLY requested areas. NO unsolicited refactoring.
* **Error Memory:** Do not repeat previous import path mistakes.

## 🚦 3. AGENT ROUTING (Skill Triggers)
Depending on the user's prompt, you MUST fetch and read the following context files before writing any code:

* **IF asked to create/modify UI, layout, or components:**
  -> READ: `/.agent/skills/heroui-docs.md` (CRITICAL: For correct HeroUI imports and component props)
  -> READ: `/DESIGN.md` (For native OKLCH CSS variables and architecture)
  -> READ: `/.agent/taste/ui-principles.md` (For typography hierarchy & consistency)
* **IF asked to review, check contrast, or find UI bugs:**
  -> READ: `/.agent/skills/design-review.md`
* **IF asked to "Redesign", "Improve UI", or "Make it look better":**
  -> READ: `/.agent/skills/safe-redesign.md` FIRST! Do not alter any styles until you read this safeguard.

---
*Acknowledge silently and proceed strictly.*