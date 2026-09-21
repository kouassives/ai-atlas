#!/bin/sh
# test-install.sh — installs into a temp OpenCode layout and checks discovery.
# Zero dependencies (POSIX sh + cmp/cp/mkdir). Run from anywhere:
#   node ... ; sh scripts/test-install.sh
set -u

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d "${TMPDIR:-/tmp}/ai-atlas-install-test.XXXXXX")
trap 'rm -rf "$TMP"' EXIT
PROJ="$TMP/proj"; CLT="$TMP/claude"; mkdir -p "$PROJ" "$CLT"

fail() { echo "FAIL: $1" >&2; exit 1; }

# 1. --list prints targets and known components
"$ROOT/install.sh" --list > "$TMP/list.txt" || fail "--list exit code"
grep -q "skills :" "$TMP/list.txt" || fail "--list missing skills target"
grep -q "agents :" "$TMP/list.txt" || fail "--list missing agents target"
grep -q "skill  fe-security" "$TMP/list.txt" || fail "--list missing a known skill"
grep -q "agent  orchestrator.md" "$TMP/list.txt" || fail "--list missing a known agent"

# 2. --dry-run copies nothing
( cd "$PROJ" && "$ROOT/install.sh" --dry-run --project > /dev/null ) || fail "--dry-run exit code"
[ -e "$PROJ/.opencode" ] && fail "--dry-run must not create .opencode"

# 3. real project install (run from the temp dir so the repo stays clean)
( cd "$PROJ" && "$ROOT/install.sh" --project > "$TMP/install.txt" ) || fail "--project install exit code"
[ -d "$PROJ/.opencode/skills" ] || fail "skills dir missing after install"
[ -d "$PROJ/.opencode/agent" ] || fail "agent dir missing after install"

njobs=$(grep -c "^  install " "$TMP/install.txt")
nexp=$(ls "$ROOT/skills" | wc -l | tr -d ' ')
[ "$njobs" -ge "$nexp" ] || fail "installed $njobs skills, expected >= $nexp"

# spot-check discovery layout
[ -f "$PROJ/.opencode/skills/fe-security/SKILL.md" ] || fail "fe-security SKILL.md not installed"
[ -f "$PROJ/.opencode/agent/orchestrator.md" ] || fail "orchestrator agent not installed"

# 4. idempotency: second run skips identical files
( cd "$PROJ" && "$ROOT/install.sh" --project > "$TMP/second.txt" ) || fail "second install exit code"
grep -q "up-to-date" "$TMP/second.txt" || fail "second run did not skip identical files"
grep -q "^  install " "$TMP/second.txt" && fail "second run reinstalled files"

# 5. --force overwrites; a modified file is skipped without it
printf '\n# marker\n' >> "$PROJ/.opencode/skills/fe-security/SKILL.md"
( cd "$PROJ" && "$ROOT/install.sh" --project > "$TMP/third.txt" ) || fail "third exit code"
grep -q "skip" "$TMP/third.txt" || fail "modified file should be skipped without --force"
( cd "$PROJ" && "$ROOT/install.sh" --project --force > "$TMP/fourth.txt" ) || fail "--force exit code"
grep -q "^  overwrite  fe-security/SKILL.md" "$TMP/fourth.txt" || fail "--force should overwrite fe-security"
cmp -s "$ROOT/skills/fe-security/SKILL.md" "$PROJ/.opencode/skills/fe-security/SKILL.md" || fail "fe-security not restored to source"

# 6. idempotent again after force-restore
( cd "$PROJ" && "$ROOT/install.sh" --project > "$TMP/fifth.txt" ) || fail "fifth exit code"
grep -q "^  install " "$TMP/fifth.txt" && fail "run after --force reinstalled files"

# 7. --agent claude-code targets a different base
( cd "$CLT" && "$ROOT/install.sh" --agent claude-code --project > /dev/null ) || fail "claude-code install exit code"
[ -f "$CLT/.claude/skills/fnd-adr/SKILL.md" ] || fail "claude-code layout not installed"

# 8. unknown agent rejected with exit 2
"$ROOT/install.sh" --agent nope > /dev/null 2>&1
rc=$?
[ "$rc" -eq 2 ] || fail "unknown agent must exit 2 (got $rc)"

echo "PASS: install.sh (discovery + idempotency + force + multi-tool)"
exit 0