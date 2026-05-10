import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // 🚀 เพิ่มบรรทัดนี้: เพื่อให้ Tailwind ดึงสีและโครงสร้างกล่อง Toast มาใช้
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/toast/dist/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: { extend: {} },
  darkMode: "class",
  plugins: [heroui()],
};
export default config;