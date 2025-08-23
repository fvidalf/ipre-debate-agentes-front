# Project Structure Guide

This document outlines the new organized structure of the AI Debate Platform codebase.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page route
│   ├── debate/            # Debate app route
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles with design tokens
├── components/            # Shared, reusable UI components
│   └── ui/               # Base UI components (Button, Card, etc.)
├── views/                # View-specific components and layouts
│   ├── landing/          # Landing page components
│   │   ├── LandingView.tsx
│   │   ├── components/   # Landing-specific components
│   │   └── index.ts
│   └── debate/           # Debate app components
│       ├── DebateAppLayout.tsx
│       ├── components/   # Debate-specific components
│       │   ├── Sidebar.tsx
│       │   ├── Canvas.tsx
│       │   ├── ToolsPanel.tsx
│       │   ├── PeoplePanel.tsx
│       │   ├── SettingsPanel.tsx
│       │   └── index.ts
│       └── index.ts
├── hooks/                # Shared hooks
├── types/                # TypeScript type definitions
├── lib/                  # Utilities and helpers
│   └── cn.ts            # Class name utility for styling
└── styles/              # Design system and styling
    ├── tokens.ts        # Design tokens (colors, spacing, etc.)
    └── patterns.ts      # Common styling patterns
```

## Architecture Principles

### 1. View-Based Organization
- Components are organized by the view/feature they belong to
- Shared components live in `/src/components/ui/`
- View-specific components live in `/src/views/{view}/components/`

### 2. Consistent Styling System
- **Design Tokens**: Centralized colors, spacing, and typography in `/src/styles/tokens.ts`
- **UI Components**: Reusable components with variant-based styling using `class-variance-authority`
- **Style Patterns**: Common styling patterns in `/src/styles/patterns.ts`

### 3. Scalable Component Architecture
- Base UI components support variants, sizes, and customization
- Consistent API across all components
- TypeScript for type safety

## Design System

### Colors
```typescript
// Primary brand colors (blues)
primary: {
  50: '#f0f9ff',   // Very light blue
  500: '#0ea5e9',  // Main brand color
  600: '#0284c7',  // Hover states
  700: '#0369a1',  // Active states
}

// Neutral colors (grays)
neutral: {
  50: '#f9fafb',   // Light backgrounds
  200: '#e5e7eb',  // Borders
  600: '#4b5563',  // Body text
  900: '#111827',  // Headings
}
```

### Component Usage

#### Button
```tsx
import { Button } from '@/components/ui';

// Primary button (default)
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### IconButton
```tsx
import { IconButton } from '@/components/ui';

<IconButton 
  icon="🛠️" 
  tooltip="Tools"
  variant="active"
  onClick={handleClick}
/>
```

## Adding New Views

### 1. Create View Structure
```bash
mkdir -p src/views/new-view/components
```

### 2. Create View Component
```tsx
// src/views/new-view/NewView.tsx
'use client';

import { Button, Card } from '@/components/ui';

export default function NewView() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Your view content */}
    </div>
  );
}
```

### 3. Create View Components
```tsx
// src/views/new-view/components/NewComponent.tsx
import { Card } from '@/components/ui';

export default function NewComponent() {
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
}
```

### 4. Export from View
```tsx
// src/views/new-view/index.ts
export { default as NewView } from './NewView';
export * from './components';
```

### 5. Add Route (if needed)
```tsx
// src/app/new-route/page.tsx
import { NewView } from '@/views/new-view';

export default function NewRoutePage() {
  return <NewView />;
}
```

## Styling Guidelines

### 1. Use Design Tokens
```tsx
// ✅ Good - uses design tokens
className="bg-neutral-50 text-neutral-900"

// ❌ Avoid - hardcoded colors
className="bg-gray-50 text-gray-900"
```

### 2. Use UI Components
```tsx
// ✅ Good - uses UI components
<Button variant="primary">Save</Button>

// ❌ Avoid - custom button styling
<button className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
```

### 3. Use Consistent Spacing
```tsx
// ✅ Good - consistent spacing patterns
className="space-y-4 p-6"

// ❌ Avoid - arbitrary spacing
className="space-y-3.5 p-5.5"
```

### 4. Use the cn() Utility
```tsx
import { cn } from '@/lib/cn';

// ✅ Good - conditional and merged classes
className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}
```

## Benefits of This Structure

1. **Scalability**: Easy to add new views and components
2. **Maintainability**: Clear separation of concerns
3. **Consistency**: Shared design system ensures consistent UI
4. **Reusability**: Base components can be used across views
5. **Type Safety**: Full TypeScript support
6. **Performance**: Tree-shaking friendly exports

## Migration Notes

- All debate-specific components moved to `/src/views/debate/`
- Shared UI components in `/src/components/ui/`
- Design tokens replace hardcoded colors
- Consistent component APIs across the app
- New landing page demonstrates the design system
