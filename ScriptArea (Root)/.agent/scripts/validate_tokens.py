# .agent/scripts/validate_tokens.py
import os
import re
import sys

# 1. กฎเหล็ก: สี Tailwind ที่ห้ามใช้เด็ดขาด (เพราะเรามีระบบสีของเราเอง)
BANNED_TAILWIND_COLORS = [
    "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", 
    "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", 
    "indigo", "violet", "purple", "fuchsia", "pink", "rose", "black"
]

# สร้าง Regex เพื่อจับคำเช่น text-gray-500, bg-blue-600, text-black
banned_pattern = re.compile(r'\b(text|bg|border)-(?:' + '|'.join(BANNED_TAILWIND_COLORS) + r')(?:-\d{2,3})?\b')

# 2. กฎเหล็ก: ห้าม Hardcode รหัส Hex ตรงๆ (ต้องใช้ var(--...))
hex_pattern = re.compile(r'#[0-9a-fA-F]{3,6}\b')

# ข้อยกเว้น: รหัส Hex ของแบรนด์ที่อนุญาตให้อนุโลมได้ (แต่ควรเตือนให้ใช้ var)
ALLOWED_HEX = ["#FFFFFF", "#F5F3ED", "#FFFCF3", "#F2DCB1", "#E8A562", "#392A1B"]

def scan_file(filepath):
    """สแกนไฟล์เพื่อหาคลาสสีที่ผิดกฎ"""
    issues_found = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # ตรวจสอบการใช้สี Tailwind ที่ห้าม
        for match in banned_pattern.finditer(line):
            issues_found.append({
                "line": line_num,
                "type": "Banned Tailwind Color",
                "issue": match.group(0),
                "suggestion": "ใช้ตัวแปร CSS ของ ScriptArea เช่น var(--text-normal) หรือ var(--bg-surface-primary)"
            })
            
        # ตรวจสอบการใช้ Hex Code ตรงๆ
        for match in hex_pattern.finditer(line):
            hex_code = match.group(0).upper()
            if hex_code not in ALLOWED_HEX:
                issues_found.append({
                    "line": line_num,
                    "type": "Hardcoded Hex",
                    "issue": hex_code,
                    "suggestion": "ห้ามใช้รหัสสีเถื่อน! กรุณาตรวจสอบ DESIGN.md และใช้ตัวแปรที่อนุญาตเท่านั้น"
                })

    return issues_found

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_tokens.py <path_to_tsx_file_or_directory>")
        sys.exit(1)
        
    target_path = sys.argv[1]
    total_issues = 0
    
    print(f"🔍 [ScriptArea Auditor] กำลังตรวจสอบสีและ Tokens ใน: {target_path}...\n")
    
    # ถ้าเป็นไฟล์เดียว
    if os.path.isfile(target_path) and target_path.endswith(('.tsx', '.jsx', '.tsx', '.css')):
        issues = scan_file(target_path)
        if issues:
            print(f"❌ พบข้อผิดพลาดในไฟล์: {target_path}")
            for issue in issues:
                print(f"   [บรรทัด {issue['line']}] {issue['type']}: '{issue['issue']}' -> 💡 {issue['suggestion']}")
            total_issues += len(issues)
            
    # ถ้าเป็นโฟลเดอร์ ให้สแกนหาไฟล์ .tsx ทั้งหมด
    elif os.path.isdir(target_path):
        for root, _, files in os.walk(target_path):
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    filepath = os.path.join(root, file)
                    issues = scan_file(filepath)
                    if issues:
                        print(f"❌ พบข้อผิดพลาดในไฟล์: {filepath}")
                        for issue in issues:
                            print(f"   [บรรทัด {issue['line']}] {issue['type']}: '{issue['issue']}' -> 💡 {issue['suggestion']}")
                        total_issues += len(issues)

    if total_issues == 0:
        print("✅ PASS! โค้ดสะอาดมาก ไม่มีการใช้สีเถื่อนหรือสีที่ขัดกับแบรนด์ ScriptArea")
    else:
        print(f"\n⚠️ สรุป: พบจุดที่ละเมิด Design System ทั้งหมด {total_issues} จุด")
        print("🤖 [TO AI AGENT]: กรุณากลับไปแก้ไขโค้ดให้ถูกต้องตาม DESIGN.md ก่อนดำเนินการต่อ!")
        sys.exit(1)

if __name__ == "__main__":
    main()