# Development Workflow

This project follows a strict branching strategy integrated with CI/CD.

## Branching Strategy

1.  **`main` (Production)**
    *   **Protected**: No direct commits.
    *   **Purpose**: Stable, production-ready code.
    *   **Deployment**: Automatically deploys to Production environment on push.

2.  **`dev` (Staging/Development)**
    *   **Purpose**: Integration branch for all features.
    *   **Source**: Branched from `main`.
    *   **Deployment**: Deploys to Staging environment (future).
    *   **Merge**: PRs from `feature/*` are merged here first.

3.  **`feature/*` (Feature Branches)**
    *   **Naming**: `feature/auth`, `feature/calendar-page`, `fix/login-bug`.
    *   **Source**: Branched from `dev`.
    *   **Purpose**: Daily development work.
    *   **Lifecycle**: Create -> Work -> Push -> PR to `dev` -> Delete.

## CI/CD Pipeline

The GitHub Actions pipeline runs on `main`, `dev`, and all `feature/*` branches.

1.  **Security Audit**: Scans npm dependencies for vulnerabilities.
2.  **Linting**: checks code quality using ESLint.
3.  **Build**: Verifies the project builds without error.
4.  **Test**: Runs unit tests (if any).

## Recommended Daily Workflow

1.  **Start a new feature**:
    ```bash
    git checkout dev
    git pull origin dev
    git checkout -b feature/my-new-feature
    ```

2.  **Work and Commit**:
    ```bash
    git add .
    git commit -m "feat: add my new feature"
    ```

3.  **Push and Test**:
    ```bash
    git push -u origin feature/my-new-feature
    # Check GitHub Actions to ensure pipeline passes (Green Check)
    ```

4.  **Merge**:
    *   Open a **Pull Request** on GitHub (`feature/...` -> `dev`).
    *   Once approved and pipeline passes, merge into `dev`.
