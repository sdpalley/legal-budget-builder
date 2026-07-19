# Repository Instructions

## GitHub publishing fallback

When `git push` to the configured remote succeeds but `gh auth status` reports
an invalid or expired token, do not stop at the stale GitHub CLI session. First
check whether the configured Git credential is available without printing it:

```sh
task_gh_token="$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill | sed -n 's/^password=//p')"
```

If the value is present, use it only in-process to call GitHub's API (never
echo, log, commit, or otherwise expose it). For a draft pull request, write the
requested metadata to a temporary JSON file and run:

```sh
GH_TOKEN="$task_gh_token" gh api --method POST repos/<owner>/<repo>/pulls --input <temporary-pr.json>
```

The JSON must include `title`, `head`, `base`, `draft: true`, and `body`. This
works with the credential that authenticated the successful Git push, even when
the persisted GitHub CLI token is expired. If no Git credential is available or
the API call is denied, report the authentication block clearly instead of
claiming that a PR was opened.
