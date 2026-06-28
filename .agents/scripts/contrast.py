# .agent/scripts/contrast.py
import sys

def hex_to_rgb(hex_color):
    """แปลงค่าสี Hex (เช่น #392A1B) เป็นค่า RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    """คำนวณค่าความสว่าง (Relative Luminance) ตามหลัก WCAG 2.0"""
    r, g, b = [x / 255.0 for x in rgb]
    
    def adjust(value):
        if value <= 0.03928:
            return value / 12.92
        return ((value + 0.055) / 1.055) ** 2.4

    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

def contrast_ratio(hex1, hex2):
    """คำนวณอัตราส่วนความต่าง (Contrast Ratio)"""
    lum1 = relative_luminance(hex_to_rgb(hex1))
    lum2 = relative_luminance(hex_to_rgb(hex2))
    
    brightest = max(lum1, lum2)
    darkest = min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)

if __name__ == "__main__":
    # วิธีใช้งาน: python contrast.py #392A1B #F5F3ED
    if len(sys.argv) != 3:
        print("Usage: python contrast.py <hex_color_1> <hex_color_2>")
        sys.exit(1)
        
    color_text = sys.argv
    color_bg = sys.argv
    
    try:
        ratio = contrast_ratio(color_text, color_bg)
        print(f"Contrast Ratio: {ratio:.2f}:1")
        
        # กฎ WCAG AA สำหรับตัวหนังสือปกติ ต้องได้ 4.5:1 ขึ้นไป
        if ratio >= 4.5:
            print("✅ PASS (WCAG AA) - สีอ่านง่าย สบายตา!")
        elif ratio >= 3.0:
            print("⚠️ WARNING - ผ่านฉิวเฉียด (ใช้ได้แค่กับหัวข้อขนาดใหญ่ หรือโลโก้)")
        else:
            print("❌ FAIL - สีกลืนกันเกินไป! ผู้ใช้อ่านไม่ออกแน่นอน ต้องปรับแก้ด่วน")
            
    except ValueError:
        print("Error: รหัสสี Hex ไม่ถูกต้อง กรุณาใส่รหัสเช่น #FFFFFF")