#!/usr/bin/env bash

set -euo pipefail

api_version="2026-03-10"
default_branch="develop"
release_branch="main"
dry_run=false

if [[ "${1:-}" == "--dry-run" ]]; then
    dry_run=true
fi

require_command() {
    local command_name="$1"

    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Missing required command: $command_name" >&2
        exit 1
    fi
}

detect_repository() {
    local origin_url

    origin_url="$(git remote get-url origin)"

    if [[ "$origin_url" =~ ^git@github\.com:(.+)/(.+)\.git$ ]]; then
        printf '%s/%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
        return
    fi

    if [[ "$origin_url" =~ ^https://github\.com/(.+)/(.+)\.git$ ]]; then
        printf '%s/%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
        return
    fi

    echo "Could not detect GitHub repository from remote: $origin_url" >&2
    exit 1
}

run_gh_api() {
    local method="$1"
    local endpoint="$2"
    local input_file="$3"

    if $dry_run; then
        echo
        echo "DRY RUN gh api --method ${method} ${endpoint}"
        cat "$input_file"
        return
    fi

    gh api \
        --method "$method" \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: ${api_version}" \
        "$endpoint" \
        --input "$input_file" \
        >/dev/null
}

write_repository_payload() {
    local output_file="$1"

    cat >"$output_file" <<EOF
{
  "default_branch": "${default_branch}",
  "allow_squash_merge": true,
  "allow_merge_commit": true,
  "allow_rebase_merge": false,
  "allow_auto_merge": false,
  "allow_update_branch": true,
  "delete_branch_on_merge": true
}
EOF
}

write_branch_payload() {
    local output_file="$1"

    cat >"$output_file" <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "ci",
      "quality"
    ],
    "checks": [
      {
        "context": "ci",
        "app_id": -1
      },
      {
        "context": "quality",
        "app_id": -1
      }
    ]
  },
  "enforce_admins": null,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
}

require_command git
require_command gh

repository="${REPOSITORY:-$(detect_repository)}"

if ! $dry_run; then
    gh auth status >/dev/null 2>&1 || {
        echo "GitHub CLI is not authenticated. Run 'gh auth login -h github.com' and retry." >&2
        exit 1
    }
fi

repo_payload="$(mktemp)"
branch_payload="$(mktemp)"
trap 'rm -f "$repo_payload" "$branch_payload"' EXIT

write_repository_payload "$repo_payload"
write_branch_payload "$branch_payload"

echo "Configuring repository ${repository}"

run_gh_api "PATCH" "repos/${repository}" "$repo_payload"
run_gh_api "PUT" "repos/${repository}/branches/${default_branch}/protection" "$branch_payload"
run_gh_api "PUT" "repos/${repository}/branches/${release_branch}/protection" "$branch_payload"

echo
echo "Release flow configured for ${repository}"
echo "- default branch: ${default_branch}"
echo "- protected branches: ${default_branch}, ${release_branch}"
