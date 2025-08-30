// Style guide and patterns for consistent UI across the application

export const styleGuide = {
  // Layout patterns
  layout: {
    container: "container mx-auto px-4",
    section: "py-16",
    grid: {
      cols2: "grid md:grid-cols-2 gap-6",
      cols3: "grid md:grid-cols-3 gap-8",
      cols4: "grid md:grid-cols-2 lg:grid-cols-4 gap-6",
    },
  },
  
  // Typography patterns
  typography: {
    heading: {
      h1: "text-4xl font-bold text-neutral-900",
      h2: "text-3xl font-bold text-neutral-900",
      h3: "text-2xl font-semibold text-neutral-900",
      h4: "text-xl font-semibold text-neutral-900",
      h5: "text-lg font-medium text-neutral-900",
    },
    body: {
      large: "text-lg text-neutral-600",
      base: "text-base text-neutral-600",
      small: "text-sm text-neutral-500",
      caption: "text-xs text-neutral-400",
    },
    link: "text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline",
  },

  // Spacing patterns
  spacing: {
    section: "space-y-8",
    stack: {
      xs: "space-y-2",
      sm: "space-y-4",
      md: "space-y-6",
      lg: "space-y-8",
      xl: "space-y-12",
    },
    inline: {
      xs: "space-x-2",
      sm: "space-x-4", 
      md: "space-x-6",
      lg: "space-x-8",
    },
  },

  // Common patterns for interactive elements
  interactive: {
    hover: "transition-all duration-150 hover:transform hover:-translate-y-0.5",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    active: "active:transform active:translate-y-0",
  },

  // Panel and section layouts
  panels: {
    sidebar: "bg-white border-r border-neutral-200",
    panel: "bg-white border border-neutral-200 rounded-xl",
    canvas: "bg-neutral-50 flex-1",
  },

  // Canvas node styling patterns
  nodes: {
    // Base node styles (working original styles)
    base: "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-2xl flex items-center justify-center shadow-lg cursor-move transition-transform",
    // Node borders
    border: {
      normal: "border border-black/5",
      selected: "border-4 border-purple-600 ring-2 ring-purple-600 ring-opacity-30",
    },
    // Node sizes
    size: {
      center: "w-24 h-24",
      peer: "w-20 h-20",
    },
    // Node states
    state: {
      normal: "hover:scale-105",
      dragging: "scale-110 shadow-xl", 
    },
    // Visual effects
    effects: {
      center: "saturate-100",
      peer: "saturate-110",
    },
  },
} as const;

// Utility function to get style patterns
export function getStylePattern(category: keyof typeof styleGuide, pattern: string, subPattern?: string): string {
  const categoryStyles = styleGuide[category] as Record<string, unknown>;
  if (subPattern && categoryStyles[pattern]) {
    const patternObj = categoryStyles[pattern] as Record<string, string>;
    return patternObj[subPattern] || '';
  }
  return (categoryStyles[pattern] as string) || '';
}

// Utility function to combine multiple style patterns
export function combineStyles(...styles: string[]): string {
  return styles.filter(Boolean).join(' ');
}

// Specialized utility for node styling
export function getNodeStyles(
  type: 'center' | 'peer',
  state: { isSelected: boolean; isDragging: boolean }
): string {
  const base = styleGuide.nodes.base;
  const size = type === 'center' ? styleGuide.nodes.size.center : styleGuide.nodes.size.peer;
  const border = state.isSelected ? styleGuide.nodes.border.selected : styleGuide.nodes.border.normal;
  const stateStyle = state.isDragging ? styleGuide.nodes.state.dragging : styleGuide.nodes.state.normal;
  const effects = type === 'center' ? styleGuide.nodes.effects.center : styleGuide.nodes.effects.peer;
  
  return combineStyles(base, size, border, stateStyle, effects);
}
