## Learnings
- Tailwind v4 uses `@import "tailwindcss";` which behaves differently from standard CSS imports regarding placement with other directives like `@plugin` and `@config`.
- Biome linter may flag Tailwind v4 directives as syntax errors or invalid import positions if not configured specifically for it.
- Placing custom CSS imports after `@import "tailwindcss";` but before `@plugin` and `@config` seems to satisfy both the linter (mostly) and the likely processing order.
