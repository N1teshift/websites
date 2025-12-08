# Git Hooks

This directory contains git hook scripts that run automatically during git operations.

## Pre-Push Hook

The pre-push hook runs **before** pushing to remote. It verifies that:

- ✅ Code passes linting checks
- ✅ Project builds successfully

### What Happens When Hook Fails?

**Nothing gets lost!** Here's what happens:

1. You've staged files with `git add` → Files remain staged
2. You've committed with `git commit` → Commit remains in local repository
3. You run `git push` → Hook runs, checks fail
4. Push is **blocked** → Nothing is pushed to remote
5. Your local changes are **safe**:
   - Staged files stay staged
   - Commits stay in your local repository
   - Your working directory is unchanged

### Workflow After Failed Hook

```
git add .                    # Stage files
git commit -m "message"      # Create commit (local only)
git push                     # Try to push → hook runs → fails

# Fix the issues (lint errors, build errors, etc.)
# Make your changes to fix the problems

git add .                    # Stage the fixes
git commit -m "fix: issues"  # Commit the fixes (or amend previous commit)
git push                     # Push again → hook runs → succeeds ✅
```

### Important Notes

- **Staged files**: Always safe, never lost
- **Local commits**: Always safe, only pushed if hook passes
- **Working directory**: Never modified by the hook
- **Remote repository**: Only updated if hook passes

The hook only **prevents** the push from happening - it doesn't modify or delete anything.

## Bypassing the Hook (Emergency Only)

If you absolutely need to push without checks (not recommended):

```bash
git push --no-verify
```

**Warning**: Only use this if you're sure the code will build, or if you're pushing to a feature branch for testing.
