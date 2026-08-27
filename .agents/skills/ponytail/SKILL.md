---
name: ponytail
description: "Use when choosing an implementation path, reviewing possible dependencies, or simplifying a coding approach. Helps prefer the smallest change that fits the requirement by checking reuse, native features, existing dependencies, and only then new packages."
---

# Ponytail

Repo-local adaptation inspired by the Ponytail approach: treat the simplest valid implementation as the default, not the fallback.

Use this skill when:
- A user asks for a new feature and there are multiple implementation paths
- A change seems likely to introduce a new dependency
- A refactor or bugfix is drifting toward unnecessary abstraction
- You are about to build something custom that the platform may already support
- You want a quick "are we overengineering this?" pass before editing code

## Core Ladder

Before adding code, walk this ladder in order:

1. **Do nothing new**
   - Check whether the requirement is already satisfied by current behavior.
   - If yes, explain that clearly instead of changing code.

2. **Reuse what already exists in the repo**
   - Search for an existing component, helper, query, service, pattern, or spec.
   - Prefer extending a nearby implementation over creating a parallel one.

3. **Use the platform or language directly**
   - Prefer built-in browser APIs, React/Next.js features, TypeScript, SQL, CSS, and existing framework primitives before inventing wrappers.

4. **Use an already-installed dependency**
   - If the repo already depends on a library that solves the problem well, use that before adding a new package.

5. **Add the smallest new code**
   - Write the minimum custom logic that solves the task without speculative abstraction.

6. **Add a new dependency only when justified**
   - Add a package only if the problem is real, repeated, and materially better solved by that package than by the options above.

## Questions To Answer Before Committing To An Approach

- What is the exact user-visible requirement?
- What is the smallest change that satisfies it?
- What existing code is closest to this behavior?
- What would make the simpler option insufficient?
- If adding a dependency, what concrete pain does it remove?

If those answers are unclear, pause and inspect the codebase before implementing.

## Dependency Gate

Before introducing a new package, confirm all of the following:

- The repo does not already have an acceptable solution
- Built-in platform features would be meaningfully worse
- The package removes real complexity, not just a few lines of code
- The maintenance, bundle, and upgrade cost is worth it
- The new dependency matches the repo's architecture and current stack decisions

If any answer is "not sure", prefer the simpler path.

## Practical Defaults

- Prefer small edits over broad refactors
- Prefer explicit code over premature abstraction
- Prefer local helpers over new shared frameworks unless reuse is already proven
- Prefer deleting code over adding orchestration
- Prefer adapting existing tests over rebuilding the test shape from scratch

## Output Style

When this skill is active:
- State the chosen path in one sentence
- Briefly note which simpler options you ruled out
- Call out a new dependency only if it is truly necessary

## Repo-Specific Guardrails

- Follow the active spec and repo briefs before optimizing implementation shape
- Do not use "simpler" as a reason to weaken auth, RLS, validation, or safety boundaries
- Do not bypass shared design tokens or documented UX rules just to save time
- Simplicity should reduce moving parts without drifting from repository contracts
