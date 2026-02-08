#!/usr/bin/env python3
import subprocess
import os

os.chdir('/vercel/share/v0-project')

# Get the original ManageAccount.tsx from main branch
result = subprocess.run(
    ['git', 'show', 'main:components/ManageAccount.tsx'],
    capture_output=True,
    text=True
)

if result.returncode == 0:
    # Write to the file
    with open('components/ManageAccount.tsx', 'w') as f:
        f.write(result.stdout)
    print("✓ Successfully restored original ManageAccount.tsx")
else:
    print("Error:", result.stderr)
