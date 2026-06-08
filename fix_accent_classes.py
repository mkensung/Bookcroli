import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace 'text-white' with 'text-[var(--accent-foreground)]' if it's on the same line as 'bg-[var(--accent)]'
    # Actually, simpler: replace within className strings that contain bg-[var(--accent)]
    def replace_in_class(match):
        class_str = match.group(1)
        if 'bg-[var(--accent)]' in class_str:
            # 1. fix hover:bg-[var(--accent)] to hover:opacity-90 ONLY IF it's on a button that is ALREADY bg-[var(--accent)]
            # Wait, some items are hover:bg-[var(--accent)] but NOT bg-[var(--accent)] originally (like dropdown items).
            # We must be careful. Let's just check if 'bg-[var(--accent)] ' or ' bg-[var(--accent)]' is in the class string (not hover:)
            
            # Find the actual background assignment
            # Note: bg-[var(--accent)] might be at the start, end, or middle
            has_bg_accent = re.search(r'(?<!hover:)bg-\[var\(--accent\)\]', class_str)
            
            if has_bg_accent:
                # If it has bg-[var(--accent)], it's an accent button.
                # Replace text-white or text-[var(--foreground)] with text-[var(--accent-foreground)]
                class_str = re.sub(r'\btext-white\b', 'text-[var(--accent-foreground)]', class_str)
                class_str = re.sub(r'text-\[var\(--foreground\)\]', 'text-[var(--accent-foreground)]', class_str)
                
                # Replace hover:bg-[var(--accent)] with hover:opacity-90
                class_str = class_str.replace('hover:bg-[var(--accent)]', 'hover:opacity-90')
            else:
                # If it's a dropdown item: hover:bg-[var(--accent)] hover:text-[var(--foreground)]
                if 'hover:bg-[var(--accent)]' in class_str:
                    class_str = class_str.replace('hover:text-[var(--foreground)]', 'hover:text-[var(--accent-foreground)]')
                    class_str = class_str.replace('hover:text-white', 'hover:text-[var(--accent-foreground)]')

        return f'className="{class_str}"'
        
    def replace_in_class_template(match):
        # Same but for template strings ` `
        class_str = match.group(1)
        if 'bg-[var(--accent)]' in class_str:
            has_bg_accent = re.search(r'(?<!hover:)bg-\[var\(--accent\)\]', class_str)
            if has_bg_accent:
                class_str = re.sub(r'\btext-white\b', 'text-[var(--accent-foreground)]', class_str)
                class_str = re.sub(r'text-\[var\(--foreground\)\]', 'text-[var(--accent-foreground)]', class_str)
                class_str = class_str.replace('hover:bg-[var(--accent)]', 'hover:opacity-90')
            else:
                if 'hover:bg-[var(--accent)]' in class_str:
                    class_str = class_str.replace('hover:text-[var(--foreground)]', 'hover:text-[var(--accent-foreground)]')
                    class_str = class_str.replace('hover:text-white', 'hover:text-[var(--accent-foreground)]')

        return f'className={{`{class_str}`}}'

    content = re.sub(r'className="([^"]+)"', replace_in_class, content)
    content = re.sub(r'className=\{`([^`]+)`\}', replace_in_class_template, content)

    # Let's also check for active:bg-[var(--accent)] etc
    # and any remaining hover:bg-[var(--accent)] that we didn't touch
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    app_dir = os.path.join(os.getcwd(), 'app')
    for root, dirs, files in os.walk(app_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
