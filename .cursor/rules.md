# Project rules

## TypeScript

- **Always type everything.** Prefer explicit types and interfaces for props, function parameters, return values, context values, API responses, and module exports.
- **Centralize types.** Put all TypeScript types, interfaces, and type aliases in the project `types/` folder (e.g. `types/index.ts` or `types/<domain>.ts`), imported with `@/types/...`. Do not add new shared or exported types in random feature files; keep only file-private types next to a single component when they are not reused.
- Avoid `any`; use `unknown` with narrowing, generics, or proper domain types when the shape is not fixed.
- Use `satisfies` or `as const` where they improve inference without hiding mistakes.

## Styles

- **Colors are tokens only.** Define every color as a CSS custom property in `app/globals.css` (e.g. under `:root` / `.dark` and wired through `@theme inline` for Tailwind). Do not use raw hex, `rgb()`, or `hsl()` values inline in components or arbitrary style objects—reference the variables (or Tailwind classes mapped to them) instead.
