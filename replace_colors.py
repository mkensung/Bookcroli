import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacements = {
        '--bg-surface-primary': '--surface',
        '--bg-surface-light': '--surface-secondary',
        '--border-outline-light': '--border',
        '--border-outline-darker': '--focus',
        '--border-outline-default': '--separator',
        '--text-normal': '--foreground',
        '--text-secondary': '--muted',
        '--text-light': '--muted',
        '--color-primary-default': '--accent',
        '--color-primary-hover': '--accent',
        '--color-primary-surface': '--surface-tertiary',
        '--status-error-default': '--danger',
        '--status-error-surface': '--danger',  # will need manual bg-[var(--danger)]/20 maybe, but let's just use danger
        '--status-error-hover': '--danger',
        # Also fix up the hover:bg-[var(--accent)] if it was hover:bg-[var(--color-primary-hover)]
    }

    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob('app/**/*.tsx', recursive=True):
    replace_in_file(filepath)
