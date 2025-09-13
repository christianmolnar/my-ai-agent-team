#!/usr/bin/env bash
set -euo pipefail
file="${1:?file required}"
needle="${2:?needle required}"
if grep -Fqn "$needle" "$file"; then
  echo "✅ Found '$needle' in $file"
  # show a quick diff to confirm
  git add -N "$file" >/dev/null 2>&1 || true
  git diff -- "$file" | sed -n '1,120p' || true
else
  echo "❌ FAIL: '$needle' not found in $file"
  exit 1
fi