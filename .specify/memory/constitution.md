<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: replaced template principles with webapp-specific minimums
Added sections: None
Removed sections: Test-First, Integration Testing, Observability, Versioning, etc.
Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md, ✅ checklist-template.md, ✅ agent-file-template.md
Follow-up TODOs: TODO(RATIFICATION_DATE): original adoption date unknown
-->

# Professional AI Assistant Frontend Constitution

## Core Principles

### I. Static-First Deployment
All code MUST be deployable as static assets suitable for GitHub Pages. No server-side dependencies permitted in the frontend.  
Rationale: Ensures compatibility with GitHub Pages and maximizes reliability and simplicity.

### II. Dynamic Capability via AWS
All dynamic features MUST interact with AWS services using secure, documented APIs. No direct database or server calls from frontend except via AWS APIs.  
Rationale: Enables dynamic functionality while maintaining a static hosting model.

### III. Minimal Dependencies
Only essential libraries and frameworks are permitted. Avoid unnecessary packages and keep the bundle size minimal.  
Rationale: Reduces complexity, improves maintainability, and ensures fast load times.

### IV. Security
All AWS interactions MUST use secure authentication (e.g., Cognito, IAM, signed requests). Secrets MUST NOT be exposed in the frontend code or configuration.  
Rationale: Protects user data and prevents unauthorized access to AWS resources.

### V. Simplicity
Codebase MUST remain as simple as possible. Avoid premature optimization and unnecessary abstraction.  
Rationale: Facilitates onboarding, maintenance, and reliability.

## Additional Constraints

- Technology stack: MUST use static-compatible frontend frameworks (e.g., React, Vue, plain HTML/JS). Backend logic, if any, MUST be handled via AWS Lambda or other serverless AWS services.
- Deployment: MUST be compatible with GitHub Pages workflow. All build artifacts MUST be static files.
- Compliance: All AWS credentials and configuration MUST be managed securely (environment variables, secrets manager, etc.).

## Development Workflow

- Code reviews are required for all changes.
- All AWS API integrations MUST be documented in the codebase.
- No test-driven development is required, but manual validation of dynamic features is mandatory before deployment.
- Deployment approval is required for changes affecting AWS integration or hosting configuration.

## Governance

- This constitution supersedes all other practices for this project.
- Amendments require documentation, rationale, and review approval.
- Versioning follows semantic rules: MAJOR for breaking changes, MINOR for new principles/sections, PATCH for clarifications.
- All PRs/reviews MUST verify compliance with these principles and constraints.
- Use project README for runtime development guidance.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2025-10-07