# Workspace Rules for ClipRadar

## 1. Automatic Git Tracking and Pushing
- **Continuous Tracking**: Always track all modifications, new files, and deletions made while working on the application.
- **Auto-Commit on Completion**: Whenever a feature, bug fix, refactor, or requested task is completed:
  - Stage the relevant modified and untracked files (`git add`).
  - Do NOT commit sensitive data (e.g., `.env`, credentials, secrets, or temporary files).
  - Create a concise and descriptive Conventional Commit message (e.g., `feat: ...`, `fix: ...`, `test: ...`, `refactor: ...`).
- **Auto-Push to GitHub**:
  - Immediately push the committed changes to the GitHub remote repository (`git push origin <branch>`).
  - If a push fails (such as missing remote URL, permission error, or authentication requirement), notify the user immediately with actionable instructions.

## 2. Safety & Verification Standards
- Check that changes do not break existing functionality or fail unit tests before committing.
- Ensure `.gitignore` rules are respected.

