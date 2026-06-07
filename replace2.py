import os
import re

replacements = {
    r'#E8F2FB': 'var(--status-info-surface)',
    r'#3B82F6': 'var(--status-info-default)',
    r'#FDEFE3': 'var(--status-warning-surface)',
    r'#F97316': 'var(--status-warning-default)',
    r'#EAF5EC': 'var(--status-success-surface)',
    r'#22C55E': 'var(--status-success-default)',
    r'bg-blue-700': 'bg-[var(--color-primary-hover)]',
    r'hover:bg-blue-700': 'hover:bg-[var(--color-primary-hover)]',
    r'bg-blue-500': 'bg-[var(--color-primary-default)]',
    r'#F3F4F6': 'var(--bg-surface-primary)',
    r'text-slate-600': 'text-[var(--text-secondary)]',
    r'hover:text-slate-600': 'hover:text-[var(--text-secondary)]',
    r'bg-slate-300': 'bg-[var(--border-outline-darker)]',
    r'#F8FAFC': 'var(--bg-surface-light)'
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        if old.startswith('#'):
            new_content = new_content.replace(old, new)
        else:
            new_content = re.sub(r'\b' + old + r'\b', new, new_content)
            
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
