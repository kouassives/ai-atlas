#!/bin/sh
# ai-atlas — POSIX-sh fallback installer (no dependencies)
#
#   ./install.sh                       global install for OpenCode -> ~/.config/opencode/
#   ./install.sh --project             project install for OpenCode -> ./.opencode/
#   ./install.sh --agent claude-code   target another tool (opencode|claude-code|codex|cursor)
#   ./install.sh --list                preview what would be copied
#   ./install.sh --dry-run             simulate (nothing written)
#   ./install.sh --force               overwrite differing files
#   ./install.sh --help                this help
#
# Copies skills/* and agents/* into the target scope. Idempotent: identical
# files are skipped, existing differing files are skipped unless --force.
# Never deletes unknown files.

set -u

# --- defaults ---------------------------------------------------------------
TOOL="${AIE_TARGET:-opencode}"
SCOPE="global"          # global | project
FORCE=0
LIST_ONLY=0
DRY_RUN=0

# --- arg parsing ------------------------------------------------------------
while [ "$#" -gt 0 ]; do
  case "$1" in
    --project)    SCOPE="project" ;;
    --agent)      shift; TOOL="${1:-}" ;;
    --force)      FORCE=1 ;;
    --list)       LIST_ONLY=1 ;;
    --dry-run)    DRY_RUN=1 ;;
    --help|-h)
      sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "install.sh: unknown option '$1' (see --help)" >&2
      exit 2
      ;;
  esac
  shift
done

# --- paths ------------------------------------------------------------------
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SKILL_SRC="$HERE/skills"
AGENT_SRC="$HERE/agents"

case "$TOOL" in
  opencode)     BASE_G="$HOME/.config/opencode"; BASE_P="./.opencode"; AGENT_DIR="agent" ;;
  claude-code)  BASE_G="$HOME/.claude";          BASE_P="./.claude";   AGENT_DIR="agents" ;;
  codex)        BASE_G="$HOME/.codex";           BASE_P="./.codex";    AGENT_DIR="agents" ;;
  cursor)       BASE_G="$HOME/.cursor";          BASE_P="./.cursor";   AGENT_DIR="agents" ;;
  *)
    echo "install.sh: unsupported --agent '$TOOL' (opencode|claude-code|codex|cursor)" >&2
    exit 2
    ;;
esac

if [ "$SCOPE" = "global" ]; then
  SKILL_DEST="$BASE_G/skills"
  AGENT_DEST="$BASE_G/$AGENT_DIR"
else
  SKILL_DEST="$BASE_P/skills"
  AGENT_DEST="$BASE_P/$AGENT_DIR"
fi

# --- inventory ---------------------------------------------------------------
skill_files=""
for d in "$SKILL_SRC"/*; do
  [ -d "$d" ] && [ -f "$d/SKILL.md" ] || continue
  skill_files="$skill_files $d/SKILL.md"
done

agent_files=""
for f in "$AGENT_SRC"/*.md; do
  [ -f "$f" ] || continue
  agent_files="$agent_files $f"
done

count_skills=$(printf '%s\n' $skill_files | sed '/^$/d' | wc -l | tr -d ' ')
count_agents=$(printf '%s\n' $agent_files | sed '/^$/d' | wc -l | tr -d ' ')

# --- list mode ---------------------------------------------------------------
if [ "$LIST_ONLY" -eq 1 ]; then
  echo "ai-atlas install manifest"
  echo "  target : $TOOL ($SCOPE)"
  echo "  skills : $SKILL_DEST  ($count_skills skills)"
  echo "  agents : $AGENT_DEST  ($count_agents agents)"
  echo ""
  for f in $skill_files; do printf '  skill  %s -> %s\n' "$(basename "$(dirname "$f")")" "${SKILL_DEST}/$(basename "$(dirname "$f")")" ; done
  for f in $agent_files; do printf '  agent  %s -> %s\n' "$(basename "$f")" "$AGENT_DEST/$(basename "$f")" ; done
  exit 0
fi

# --- copy helper -------------------------------------------------------------
# copies $1 -> $2 unless already identical; SKIPs differing files without --force
copy_one() {
  src="$1"; dst="$2"
  rel="${dst#$SKILL_DEST/}"; [ "$rel" = "$dst" ] && rel="${dst#$AGENT_DEST/}"
  if [ -e "$dst" ]; then
    if cmp -s "$src" "$dst"; then
      printf '  up-to-date %s\n' "$rel"
      return 0
    fi
    if [ "$FORCE" -eq 0 ]; then
      printf '  skip       %s (differs; use --force) -- %s\n' "$rel" "${dst}"
      return 0
    fi
    printf '  overwrite  %s\n' "$rel"
  else
    printf '  install    %s\n' "$rel"
  fi
  if [ "$DRY_RUN" -eq 1 ]; then
    return 0
  fi
  mkdir -p "$(dirname -- "$dst")"
  cp "$src" "$dst"
}

# --- run ----------------------------------------------------------------------
if [ "$DRY_RUN" -eq 1 ] || [ "$LIST_ONLY" -eq 1 ]; then
  echo "ai-atlas install (dry-run)"
else
  echo "ai-atlas install -> $TOOL ($SCOPE)"
fi
if [ "$DRY_RUN" -eq 0 ] && [ "$LIST_ONLY" -eq 0 ]; then
  echo "  target : $SKILL_DEST + $AGENT_DEST"
  echo "  contents: $count_skills skills, $count_agents agents"
fi

for f in $skill_files; do
  name=$(basename "$(dirname "$f")")
  copy_one "$f" "$SKILL_DEST/$name/SKILL.md"
done
for f in $agent_files; do
  copy_one "$f" "$AGENT_DEST/$(basename "$f")"
done

if [ "$DRY_RUN" -eq 0 ] && [ "$LIST_ONLY" -eq 0 ]; then
  echo "  done. restart your assistant to load the installed skills."
fi
exit 0