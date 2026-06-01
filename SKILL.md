# 🤖 AI Developer Guidelines & Project Rules (BooksTator)

**[CRITICAL INSTRUCTION FOR AI AGENTS]**
Upon initiating a new session or modifying this project, you MUST read, understand, and strictly adhere to the following 4 rules. Violation is strictly prohibited.

---

## 🏗️ 1. UI Framework & Animation Constraints
* **Primary Framework:** Strictly use **HeroUI v.3 (latest)** as the core framework for all components, UI structures, and baseline motions.
* **Exception for Severe Bugs:** If HeroUI's motion system causes critical dependency conflicts or fatal errors, you are explicitly permitted to fallback to `framer-motion` to ensure flawless UI animations (e.g., Drawers, Switches).
* **Strict Permission Rule:** DO NOT install, fetch, or import any unauthorized external libraries or packages. You MUST notify the user and request explicit permission before introducing new tools.
> 💡 **Human Note (กฎการใช้เครื่องมือ):** บังคับใช้ HeroUI v.3 เป็นหลัก แต่ถ้าอนิเมชันมีบั๊กรุนแรงแก้ไม่ได้ อนุญาตให้ใช้ framer-motion แทนได้ ห้ามลงแพ็กเกจอื่นๆ นอกเหนือจากนี้โดยไม่ขออนุญาตเด็ดขาด

## 🎨 2. Design Consistency & Law of UX/UI
* **Absolute Consistency:** All UI elements must maintain pixel-perfect consistency. Spacing, sizing, and border-radii must be logically proportional and strictly adhere to the Tailwind CSS scale (e.g., `gap-4`, `p-6`).
* **Action-Based Styling:** Buttons with identical purposes must share identical visual styling across the application.
    * *Primary Actions* (Save/Confirm) must share a unified color scheme and variant.
    * *Destructive Actions* (Delete/Cancel) must be strictly distinct and consistent.
* **UX Principles:** Strictly follow the Laws of UX. Apply the Law of Proximity by grouping related data, ensuring the UI remains highly predictable and intuitive.
> 💡 **Human Note (กฎความสม่ำเสมอ):** UI ต้องเป๊ะระดับ Pixel-perfect ระยะช่องไฟและปุ่มต่างๆ ต้องใช้สัดส่วน Tailwind เดียวกัน ปุ่มไหนทำหน้าที่เหมือนกัน (เช่น ยืนยัน หรือ ยกเลิก) หน้าตาต้องเหมือนกันทั้งแอป ยึดหลัก Law of UX เสมอ

## 🧠 3. Error Memory & Bug Prevention
* **Do Not Repeat Mistakes:** You must analyze the root cause of any encountered error and **memorize** the failure context to prevent repeating the exact same error in subsequent outputs.
* **Historical Context Example 1:** Beware of HeroUI v3 import paths (e.g., `<Switch>` must be imported from `@heroui/switch`, NOT `@heroui/react`).
* **Historical Context Example 2:** Beware of missing icon packages. This project relies exclusively on `@gravity-ui/icons` or Native SVGs.
> 💡 **Human Note (กฎการจำความผิดพลาด):** ห้ามทำ Error เดิมซ้ำๆ ถ้าระบบพังต้องวิเคราะห์และจำไว้เลย เช่น การดึง Switch จาก HeroUI ต้องดึงให้ถูกไฟล์ หรือไอคอนต้องใช้ของ Gravity UI หรือ Native SVG เท่านั้น

## 🎯 4. Strict Scope Control
* **Laser Focus:** Restrict your code modifications (both logic and design) **ONLY** to the specific area requested by the user and its direct dependencies.
* **No Unsolicited Refactoring:** DO NOT touch, modify, or refactor unrelated code structures, even if you believe you can optimize them.
* **Isolated Changes:** Ensure your modifications do not cause regression bugs in pre-existing, functioning components.
> 💡 **Human Note (กฎการคุมขอบเขต):** สั่งให้แก้ตรงไหน ให้แก้แค่ตรงนั้น! ห้ามไปแตะหรือจัดระเบียบโค้ดส่วนอื่นที่ไม่ได้สั่งเด็ดขาด แม้จะหวังดีก็ตาม เพื่อป้องกันส่วนอื่นพัง (Regression)

---
*If you understand these rules, please acknowledge them silently and proceed strictly according to the user's prompt.*