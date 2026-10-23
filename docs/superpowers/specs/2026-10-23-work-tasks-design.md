# /work-tasks: task-runner agent for Apacheta (app + API)

Date: 2026-10-23. Status: draft for Bruno's review.

## Intent

Bruno writes detailed tasks in one file, types `/work-tasks` in a Claude Code session, and the agent works through every pending task across the two Apacheta projects. Each task ends up built on its own branch or rejected with a reason. At the end the agent writes a report. Bruno tests by hand and merges to `main` himself.

The agent should act like someone who already knows both codebases. It reads every bit of project context before touching code: both CLAUDE.md files, the docs, saved memory, and past session transcripts.

## The two projects

They are separate GitHub repos. Never mix them: separate branches, commits and pushes.

| | app | api |
|---|---|---|
| Path | `/home/bruno/projects/v0apacheta` | `/home/bruno/projects/neptuno` |
| Stack | Next.js App Router, Tailwind | NestJS, Sequelize, Postgres (docker) |
| Package manager | pnpm (`pnpm-lock.yaml`) | npm (`package-lock.json`; ignore the yarn and pnpm lockfiles) |
| Run | `npm run dev` on :3000 | `npm run start:dev` on :8080 (`PORT` in `.env`) |
| Tests | `pnpm test` (jest) | `npm test` (jest, `*.spec.ts` in `src/`) |
| Context | `CLAUDE.md`, `docs/`, `docs/communication/` | `CLAUDE.md` (to be written, see below), `README.md`, `PROJECT_ANALYSIS.md`, `PAYMENT_SYSTEM.md`, `PATRIMONY_*.md`, `docs/` |

The app talks to the API through server actions in `lib/actions/*` and route handlers in `lib/http/*`, using `API_URL`.

Bruno plans to move both repos into one `apacheta/` folder later. All paths are kept in one place in the skill so that move is a single edit.

## Goals

- One command runs every pending task in the task file, one after another.
- For each task: read the context, decide whether to build or reject, build it test-first, check it in the running app and API, then commit and push a branch.
- A report at the end: solved, rejected (with why), changed files, branches, commits, test results, doc problems found.
- Rules that matter are enforced by settings, not only written down.

## Non-goals

- Merging or pushing to `main`. Bruno does that.
- Deploying.
- Fixing docs. The agent reports wrong or outdated docs and leaves them alone.
- An external task tracker. A Plane integration may come later, so task I/O stays in one isolated section of the skill.

## Anti-goals (a failure even if the code works)

- Changes from two tasks mixed on one branch, or app and API changes mixed in one repo.
- Tests weakened, skipped or deleted to get to green.
- Touching `.env` files or secrets.
- Silently doing half a task and calling it solved.

## Task file

`/home/bruno/projects/TASKS.md`. It lives outside both repos, so switching branches never changes it. Bruno writes the tasks; the agent updates only each task's `Status` line and appends a `### Result` section.

```markdown
## T-001: Short title
Status: pending
Repos: app, api            <!-- optional; the agent decides if omitted -->

Detailed description written by Bruno.

Acceptance:
- what must be true when done
```

Statuses: `pending` (Bruno wrote it), `solved`, or `rejected` (both set by the agent). To retry a rejected task, Bruno edits it and sets it back to `pending`.

### Task I/O, isolated for a future Plane swap

The skill has one section, "Task source", that defines exactly three operations. Nothing else in the skill touches the file directly.

- `list_pending()`: every `pending` task, in file order.
- `set_status(id, status)`
- `append_result(id, markdown)`

## Run flow

1. **Preflight.**
   - Both repos are on `main` with clean working trees, synced with `origin/main` (`git pull --ff-only`). If one is dirty, stop and say so.
   - Start the dev servers in the background with logs to `/home/bruno/projects/.work-tasks/logs/{app,api}.log`. If a server is already listening on its port, reuse it.
2. **Load context, once per run.**
   - Both CLAUDE.md files and both projects' docs.
   - Saved memory for both projects: `~/.claude/projects/-home-bruno-projects-v0apacheta/memory/` and `-home-bruno-projects-neptuno/memory/`.
   - Past session transcripts (`*.jsonl` in those same project folders), searched by keyword per task rather than read whole.
3. **For each pending task, in order:**
   1. Pull more context relevant to the task: the specific docs, the code, transcript search hits. Record in the result which docs, memories and sessions were used.
   2. **Decide: build or reject.** Reject, with the reason written in the result, when:
      - the description is ambiguous in a way that changes what gets built
      - it needs a product or design decision only Bruno can make
      - it is really several tasks
      - it needs a destructive data change, such as dropping or renaming a column, or a hand-run SQL migration in `migrations/`
      - two honest attempts failed

      Additive model changes are allowed (`sync alter` applies them to the local DB on boot) but are flagged in the report.
   3. **Branch** in each touched repo, from up-to-date `main`: `task/<id>-<slug>`. If a task builds on an earlier task from the same run, branch from that task's branch and say so in the report.
   4. **Build.** API first, then app. Test-first. Run only the related tests while working.
   5. **Check it live:**
      - The API with curl against :8080.
      - The app in a headless browser against :3000 (screenshots where useful).
      - Both server logs for errors.
   6. **Self-review.** A fresh subagent reviews each repo's diff for bugs. Fix clear bugs; list the rest in the result.
   7. **Commit and push.** Commit on the task branch in each repo and push that branch (`git push -u origin task/...`).
   8. **Record.** Write the result into the task and set it to `solved`. Return both repos to `main` before the next task.
4. **End of run.**
   - Run the full test suite once in each repo, on each task branch that touched it.
   - If a suite fails because of the agent's change, try to fix it once on that branch. Otherwise report the failure as is. Never weaken tests.
   - Leave the dev servers running so Bruno can test.
   - Write the report to `/home/bruno/projects/.work-tasks/reports/<YYYY-MM-DD-HHMM>.md` and print a short summary.

## Report contents

Per task:
- status, with the reason if rejected
- branches and commits per repo
- files changed
- schema changes, flagged
- tests run and their results
- what was checked live
- review findings not fixed
- docs, memories and sessions used
- docs found wrong or outdated

At the top: counts, plus anything that needs Bruno's attention first.

## Enforcement (settings and hooks)

Bruno asked for no prompts during a run. Both repos' `.claude/settings.json` get these settings, so they apply whichever repo the session starts in:
- a broad allow list, `defaultMode: acceptEdits`
- `additionalDirectories` for the other repo, `/home/bruno/projects` and `~/.claude/projects`
- one PreToolUse hook: `python3 ~/.claude/skills/work-tasks/hooks/guard.py`

**The guard only enforces while `/home/bruno/projects/.work-tasks/RUNNING` exists.** The skill creates that file at the start of a run and removes it at the end. That way normal sessions, such as publishing a blog post with a push to `main`, are unaffected.

During a run it blocks:
- pushes to `main`/`master`
- bare pushes with no explicit branch
- force pushes
- `git merge`
- `git rebase`
- `git commit` while on `main`/`master`
- any Bash, Read, Edit or Write that touches `.env*` (except `.env.example`)

If a run crashes, the marker stays behind and the guard keeps enforcing until someone deletes it.

## Pieces to build

1. The skill `~/.claude/skills/work-tasks/SKILL.md`, user-level so it works from a session in either repo (and later the `apacheta/` folder), plus `hooks/guard.py`. Workspace rules (running the projects, the dev DB, precedence) go in `/home/bruno/projects/CLAUDE.md`, which sessions in both repos load as a parent CLAUDE.md.
2. `neptuno/CLAUDE.md`: short, pointing to the existing docs, not repeating them. Covers:
   - npm
   - how to run and test
   - `sync alter` on boot
   - every new route uses `CurrentUser` and the ownership helpers and gets a case in `src/security.spec.ts`
   - the docs index
3. The settings changes in both repos.
4. `/home/bruno/projects/TASKS.md` with a format header and one small sample task that touches both repos, for a dry run together.

## Decided by Bruno

- Read all context possible, past sessions included.
- The agent runs the projects itself to read logs; `.next` corruption is acceptable (fix it with `rm -rf .next`). The "never run next dev" line was removed from CLAUDE.md.
- The agent creates and pushes branches; Bruno merges to `main`.
- Full test suites only at the end of the run.
- Reject tasks that are too tangled; build the rest.
- App and API are separate GitHub projects; never mix them.

## My calls (Bruno to check)

- One branch per task per repo, `task/<id>-<slug>`.
- The skill lives in `~/.claude/skills`, not in a repo.
- Reports go in `/home/bruno/projects/.work-tasks/`.
- Destructive schema changes are rejected; additive ones are allowed and flagged.
- The run stops at preflight if a repo has uncommitted changes to tracked files. Untracked files are ignored.
- The setup pieces (both settings files, `neptuno/CLAUDE.md`, the CLAUDE.md edit, this spec) go on a `setup/work-tasks` branch in each repo and get pushed. Bruno merges them to `main` before the first run.
- Instructions in the skill and in CLAUDE.md beat older saved memory. Memory is context, not orders. The two memories that contradicted this flow ("kill dev servers", "don't commit") were already updated or removed on 2026-10-23.
- Settings: the allow rules and the guard hook go in each repo's committed `.claude/settings.json`. The hook entry points to `~/.claude/skills/work-tasks/hooks/guard.py`.

## Left to the builder

- The exact wording of the skill.
- Transcript search tactics.
- The headless browser setup (Chrome CDP, as used before in this repo).
- The guard hook's implementation.
