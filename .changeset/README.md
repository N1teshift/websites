# Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs.

## What are Changesets?

Changesets are markdown files that describe what changed in a package. They help us:
- Track what changed in each package
- Generate version numbers automatically
- Create detailed changelogs
- Coordinate releases

## Workflow

### 1. When you make a change

After making changes to a package, create a changeset:

```bash
pnpm changeset
```

This will prompt you:
- Which packages changed? (select with space, confirm with enter)
- What type of change? (major/minor/patch)
- Write a summary of the change

Example:
```
Which packages changed?
❯◉ @websites/infrastructure
 ◯ @websites/ui

What kind of change?
❯◉ patch
 ◯ minor
 ◯ major

Summary: Fixed authentication token refresh issue
```

This creates a file in `.changeset/` like:
```
---
"@websites/infrastructure": patch
---

Fixed authentication token refresh issue
```

### 2. Version bumping

When ready to create a new version:

```bash
pnpm changeset:version
```

This will:
- Read all changesets
- Bump version numbers in `package.json` files
- Generate/update `CHANGELOG.md` files
- Delete the changeset files

### 3. Publishing (if publishing to npm)

If you were publishing to npm (this is a private repo, so optional):

```bash
pnpm changeset:publish
```

## Package Configuration

Apps (`@websites/templatepage`, `@websites/ittweb`, etc.) are ignored from changesets since they're applications, not libraries.

Only packages (`@websites/infrastructure`, `@websites/ui`, etc.) are versioned.

## Best Practices

- Create a changeset for every meaningful change
- Use descriptive summaries
- Choose patch for bug fixes, minor for features, major for breaking changes
- Commit changesets along with your code changes
