# UI Coding Standards

## Rule: shadcn/ui only

All UI in this project must be built exclusively from shadcn/ui components. **No custom components may be created.**

## Rationale

shadcn/ui provides a complete, accessible, consistently styled component library. Building outside of it creates visual inconsistency, duplicates solved problems, and bypasses the accessibility work already baked into Radix UI primitives.

## What this means in practice

- **Do not** create files under `src/components/` that are not shadcn/ui component installs.
- **Do not** build composite components by hand (e.g. a custom `<Modal>`, `<Card>`, or `<Badge>`). Install the shadcn/ui equivalent instead.
- **Do not** use raw HTML elements (`<button>`, `<input>`, `<select>`, etc.) for interactive UI. Always reach for the shadcn/ui component.
- **Do** compose pages and features by combining shadcn/ui components together.
- **Do** pass `className` props to extend or override styles on existing shadcn/ui components when needed.

## Installing components

```bash
npx shadcn@latest add <component-name>
```

Components are installed into `src/components/ui/`. Do not hand-edit these files unless absolutely necessary — re-run the install command to upgrade.

## Project configuration

| Setting | Value |
|---|---|
| Style | `radix-nova` |
| Base color | `neutral` |
| CSS variables | enabled |
| Icon library | `lucide-react` |
| RSC support | enabled |

CSS tokens and theme values live in `src/app/globals.css` under `@theme`. Do not add Tailwind configuration files — use CSS `@theme` directives instead (Tailwind v4).

## Currently installed components

| Component | Path |
|---|---|
| Button | `src/components/ui/button.tsx` |

Run `npx shadcn@latest add <name>` to install additional components as needed. The full component catalog is at https://ui.shadcn.com/docs/components.

## Styling rules

- Use Tailwind utility classes for layout, spacing, and responsive behavior.
- Use the design token CSS variables (e.g. `bg-background`, `text-foreground`, `border-border`) defined in `globals.css` — do not hardcode colors.
- Dark mode is handled automatically via CSS variables; do not add manual dark-mode logic.

## Date formatting

All date formatting must use [date-fns](https://date-fns.org/). Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date library.

### Required format

Dates displayed to the user must follow this pattern:

```
1st Sep 2025
2nd Aug 2026
3rd Jan 2024
4th Mar 2025
```

That is: **ordinal day + 3-letter month abbreviation + 4-digit year**.

### Implementation

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // → "1st Sep 2025"
```

Use this format everywhere a date is shown to the user. Do not invent alternate formats (e.g. `MM/DD/YYYY`, `YYYY-MM-DD`, `January 1, 2025`) for display purposes. ISO strings (`YYYY-MM-DD`) are acceptable only in `<input type="date">` values or API payloads, never for visible text.

## What is not allowed

| Pattern | Instead |
|---|---|
| Hand-written `<button>` | `<Button>` from shadcn/ui |
| Custom modal component | `<Dialog>` from shadcn/ui |
| Custom dropdown | `<DropdownMenu>` from shadcn/ui |
| Custom form inputs | `<Input>`, `<Select>`, `<Checkbox>` etc. from shadcn/ui |
| Inline `style={{}}` for theming | CSS variable tokens via Tailwind classes |
| Third-party component libraries (MUI, Chakra, Ant Design) | shadcn/ui equivalents |
