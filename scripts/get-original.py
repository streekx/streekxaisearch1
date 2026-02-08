#!/usr/bin/env python3
import subprocess
import sys

# Restore the original ManageAccount.tsx from git main branch
result = subprocess.run(
    ['git', 'show', 'main:components/ManageAccount.tsx'],
    cwd='/vercel/share/v0-project',
    capture_output=True,
    text=True
)

if result.returncode == 0:
    print(result.stdout)
else:
    print(f"Error: {result.stderr}", file=sys.stderr)
    sys.exit(1)
