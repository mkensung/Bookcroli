# 🤖 AI Developer Guidelines & Project Rules (.agents)

**[CRITICAL INSTRUCTION]**
You MUST adhere to these absolute rules. Violation is strictly prohibited.

## 🏗️ 1. Framework & Core Dependencies
* **Primary Framework:** Strictly use **HeroUI v.3 (latest)**.
* **Exception:** Use `framer-motion` ONLY for complex animations if HeroUI bugs out. Request permission before adding new packages.

## 🧠 2. Safe Integration & Scope Control
* **Laser Focus:** Modify ONLY requested areas. NO unsolicited refactoring.
* **Error Memory:** Do not repeat previous import path mistakes.

## 🚦 3. AGENT ROUTING (Context Files)
The system will now automatically load skills when needed, but always ensure you read the following context files for UI and Design tasks:

* **IF asked to create/modify UI, layout, or components:**
  -> READ: `.agents/DESIGN.md` (For native OKLCH CSS variables and architecture)
  -> READ: `.agents/taste/ui-principles.md` (For typography hierarchy & consistency)
  -> The `heroui-docs` skill will trigger automatically.

* **IF asked to review, check contrast, or find UI bugs:**
  -> The `design-review` skill will trigger automatically.

* **IF asked to "Redesign", "Improve UI", or "Make it look better":**
  -> The `safe-redesign` skill will trigger automatically.

---
*Acknowledge silently and proceed strictly.*