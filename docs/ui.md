# UI Coding Standards

This document outlines the UI development standards and guidelines for this project. **These standards are mandatory and must be followed for all UI development.**

## Component Library

### shadcn/ui Components Only

**CRITICAL RULE**: This project uses **ONLY** [shadcn/ui](https://ui.shadcn.com/) components for all UI elements.

- ✅ **DO**: Use shadcn/ui components exclusively
- ❌ **DO NOT**: Create custom UI components
- ❌ **DO NOT**: Use other component libraries (Material-UI, Ant Design, Chakra UI, etc.)
- ❌ **DO NOT**: Build custom buttons, inputs, dialogs, cards, or any other UI primitives from scratch

### Installing shadcn/ui Components

When you need a new UI component:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Available Components

Refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for the full list of available components including:

- Buttons
- Forms (Input, Textarea, Select, Checkbox, Radio, etc.)
- Data Display (Card, Table, Badge, Avatar, etc.)
- Feedback (Alert, Toast, Dialog, Sheet, etc.)
- Navigation (Tabs, Dropdown Menu, Command, etc.)
- Overlays (Dialog, Popover, Tooltip, etc.)

### Component Composition

While custom UI components are forbidden, you **may** create:

- **Container/Layout components** that compose shadcn/ui components
- **Business logic components** that use shadcn/ui components
- **Page-specific components** that organize shadcn/ui components

Example of acceptable composition:

```tsx
// ✅ ACCEPTABLE: Composing shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WorkoutCard({ workout }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{workout.description}</p>
        <Button>Start Workout</Button>
      </CardContent>
    </Card>
  )
}
```

Example of **unacceptable** custom component:

```tsx
// ❌ FORBIDDEN: Custom UI component
export function CustomButton({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

## Date Formatting

### date-fns Library

All date formatting **must** be done using [date-fns](https://date-fns.org/).

```bash
npm install date-fns
```

### Standard Date Format

Dates must be formatted with ordinal day suffix, abbreviated month, and full year:

**Format Pattern**: `do MMM yyyy`

**Examples**:
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024
- 21st Dec 2025
- 22nd Nov 2024
- 23rd Oct 2025

### Implementation

```tsx
import { format } from 'date-fns'

// Format a date
const formattedDate = format(new Date(), 'do MMM yyyy')
// Output: "16th Feb 2026"

// In a component
export function WorkoutDate({ date }: { date: Date }) {
  return <span>{format(date, 'do MMM yyyy')}</span>
}
```

### Date Formatting Rules

- ✅ **DO**: Use `format()` from date-fns
- ✅ **DO**: Use the format string `'do MMM yyyy'`
- ❌ **DO NOT**: Use native JavaScript date methods like `toLocaleDateString()`
- ❌ **DO NOT**: Create custom date formatting functions
- ❌ **DO NOT**: Use other date libraries (moment.js, dayjs, etc.)
- ❌ **DO NOT**: Use different date formats unless explicitly specified

### Other Date Operations

For date manipulation and comparison, continue using date-fns:

```tsx
import { addDays, subMonths, isBefore, parseISO } from 'date-fns'

// Add days
const futureDate = addDays(new Date(), 7)

// Subtract months
const pastDate = subMonths(new Date(), 3)

// Compare dates
const isEarlier = isBefore(date1, date2)

// Parse ISO strings
const parsed = parseISO('2026-02-16')
```

## Styling

### Tailwind CSS

- Use Tailwind CSS v4 utility classes for styling
- Follow the color and spacing system defined in `globals.css`
- Use dark mode classes when needed: `dark:bg-gray-800`

### shadcn/ui Customization

shadcn/ui components can be customized via:

1. **Tailwind classes**: Pass `className` prop to override styles
2. **CSS variables**: Modify theme variables in `globals.css`
3. **Component variants**: Use built-in variant props

```tsx
// Customizing via className
<Button className="w-full" variant="outline">
  Click me
</Button>
```

## Enforcement

These standards are **non-negotiable**:

1. **Code reviews** will reject any custom UI components
2. **Pull requests** must use shadcn/ui components only
3. **Date formatting** must follow the `do MMM yyyy` pattern
4. **Consistency** is critical for maintainability

## Quick Reference

### Before Adding UI

❓ "Do I need a button?" → `npx shadcn@latest add button`
❓ "Do I need a form input?" → `npx shadcn@latest add input`
❓ "Do I need a modal?" → `npx shadcn@latest add dialog`
❓ "Do I need to format a date?" → `import { format } from 'date-fns'`

### Never Do

- ❌ Create `CustomButton.tsx`
- ❌ Create `CustomInput.tsx`
- ❌ Create `CustomCard.tsx`
- ❌ Create `formatDate()` utility
- ❌ Use `new Date().toLocaleDateString()`

### Always Do

- ✅ `import { Button } from "@/components/ui/button"`
- ✅ `import { Input } from "@/components/ui/input"`
- ✅ `import { Card } from "@/components/ui/card"`
- ✅ `import { format } from 'date-fns'`
- ✅ `format(date, 'do MMM yyyy')`

---

**Last Updated**: 16th Feb 2026
**Applies To**: All developers and AI assistants working on this project
