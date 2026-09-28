# elimi-cap
The Competency Assessment Portal (CAP) is a platform aligned to the NOS/NSQ standards that enables evidence-based competency assessment for regular assessment for learners and Recognition of Prior Learning (RPL) for experienced artisans without formal certification

## Checks before merging

```bash
npm run typecheck   # TypeScript
npm run test:e2e    # Playwright end-to-end tests (starts the dev server itself)
npm run test:e2e:ui # same, with Playwright's interactive UI
```

End-to-end tests live in `e2e/`. They never call the real backend: the app is
pointed at fake hosts and `e2e/support/mockApi.ts` answers every request, so
tests are fast and don't need staging data. When you fix a bug in a user flow,
add a test for it there so it can't silently come back.

CI (`.github/workflows/ci.yml`) runs typecheck, lint (non-blocking for now),
build and the e2e suite on every pull request.
