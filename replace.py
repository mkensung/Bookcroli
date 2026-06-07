import os
import re

replacements = {
    r'text-slate-400': 'text-[var(--text-light)]',
    r'text-slate-500': 'text-[var(--text-secondary)]',
    r'text-slate-700': 'text-[var(--text-normal)]',
    r'text-slate-800': 'text-[var(--text-normal)]',
    r'text-slate-900': 'text-[var(--text-normal)]',
    r'bg-slate-50': 'bg-[var(--bg-surface-primary)]',
    r'bg-slate-100': 'bg-[var(--bg-surface-light)]',
    r'bg-slate-200': 'bg-[var(--border-outline-light)]',
    r'bg-slate-900': 'bg-[var(--text-normal)]',
    r'border-slate-100': 'border-[var(--border-outline-light)]',
    r'border-slate-200': 'border-[var(--border-outline-light)]',
    r'text-blue-600': 'text-[var(--color-primary-default)]',
    r'hover:text-blue-600': 'hover:text-[var(--color-primary-default)]',
    r'bg-blue-50': 'bg-[var(--color-primary-surface)]',
    r'hover:bg-blue-50': 'hover:bg-[var(--color-primary-surface)]',
    r'bg-blue-100': 'bg-[var(--color-primary-surface)]',
    r'bg-blue-600': 'bg-[var(--color-primary-default)]',
    r'border-blue-200': 'border-[var(--color-primary-default)]',
    r'text-red-500': 'text-[var(--status-error-default)]',
    r'hover:text-red-600': 'hover:text-[var(--status-error-hover)]',
    r'text-red-600': 'text-[var(--status-error-hover)]',
    r'bg-red-50': 'bg-[var(--status-error-surface)]',
    r'hover:bg-red-50': 'hover:bg-[var(--status-error-surface)]',
    r'bg-red-100': 'bg-[var(--status-error-surface)]',
    r'bg-red-500': 'bg-[var(--status-error-default)]',
    r'hover:bg-red-600': 'hover:bg-[var(--status-error-hover)]',
    r'bg-red-600': 'bg-[var(--status-error-hover)]',
    r'#FFF5E1': 'var(--bg-surface-light)',
    r'#E3D3B1': 'var(--color-primary-surface)',
    r'#858175': 'var(--text-secondary)'
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
