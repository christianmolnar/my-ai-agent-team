#!/usr/bin/env bash
set -euo pipefail
file="${1:?file required}"
from="${2:?from_text required}"
to="${3:?to_text required}"
perl -0777 -pe "s/\Q$from\E/$to/g" -i "$file"
if grep -Fq "$to" "$file"; then
  echo "✅ Replacement present in $file"
else
  echo "⚠️  WARN: no matches replaced in $file"
  exit 2
fi