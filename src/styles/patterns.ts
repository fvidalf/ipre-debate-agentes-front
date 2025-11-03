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
    canvas: "bg-[#f3f3f3] flex-1",
  },

  // Canvas node styling patterns
  nodes: {
    // Base node styles (working original styles)
    base: "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-2xl flex items-center justify-center shadow-lg cursor-move transition-transform",
    // Tool node base (circular instead of rounded-2xl)
    toolBase: "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-lg cursor-move transition-transform",
    // Node borders
    border: {
      normal: "border border-black/5",
      selected: "border-4 border-purple-600 ring-2 ring-purple-600 ring-opacity-30",
    },
    // Node sizes by variant
    size: {
      small: {
        center: "w-8 h-8",
        peer: "w-8 h-8",
        tool: "w-7 h-7", // Tool nodes are smaller and circular
        inner: { center: "w-7 h-7", peer: "w-7 h-7", tool: "w-6 h-6" },
        icon: "w-3 h-3",
      },
      medium: {
        center: "w-14 h-14",
        peer: "w-14 h-14",
        tool: "w-12 h-12", // Tool nodes are smaller and circular
        inner: { center: "w-12 h-12", peer: "w-12 h-12", tool: "w-10 h-10" },
        icon: "w-6 h-6",
      },
      large: {
        center: "w-20 h-20",
        peer: "w-20 h-20",
        tool: "w-18 h-18", // Tool nodes are smaller and circular - made bigger
        inner: { center: "w-16 h-16", peer: "w-16 h-16", tool: "w-15 h-15" },
        icon: "w-8 h-8",
      },
    },
    // Mini variant styles (uses same sizing system but different visual approach)
    mini: {
      base: "absolute transform -translate-x-1/2 -translate-y-1/2",
      inner: "w-full h-full rounded-lg bg-white border-2 flex items-center justify-center shadow-sm",
    },
    // Inner node styling for editor/simulation variants
    inner: {
      base: "rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-inner",
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
      tool: "saturate-120",
    },
    // Tool node colors by tool type
    toolColors: {
      wikipedia_tool: "#3B82F6", // Blue
      news_tool: "#EF4444", // Red
      pages_tool: "#10B981", // Green
      google_ai_tool: "#8B5CF6", // Purple
      documents_tool: "#F59E0B", // Amber
      notes_tool: "#EC4899", // Pink
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
  type: 'center' | 'peer' | 'tool',
  state: { isSelected: boolean; isDragging: boolean },
  nodeSize: 'small' | 'medium' | 'large' = 'medium'
): string {
  const base = type === 'tool' ? styleGuide.nodes.toolBase : styleGuide.nodes.base;
  const size = styleGuide.nodes.size[nodeSize][type];
  const border = state.isSelected ? styleGuide.nodes.border.selected : styleGuide.nodes.border.normal;
  const stateStyle = state.isDragging ? styleGuide.nodes.state.dragging : styleGuide.nodes.state.normal;
  const effects = styleGuide.nodes.effects[type];
  
  return combineStyles(base, size, border, stateStyle, effects);
}

// Utility to get node size information for a specific variant
export function getNodeSizeInfo(nodeSize: 'small' | 'medium' | 'large' = 'medium') {
  return styleGuide.nodes.size[nodeSize];
}

// Utility to get inner node size for a specific node type and size variant
export function getInnerNodeSize(
  type: 'center' | 'peer' | 'tool', 
  nodeSize: 'small' | 'medium' | 'large' = 'medium'
): string {
  return styleGuide.nodes.size[nodeSize].inner[type];
}

// Utility to get tool node color
export function getToolNodeColor(toolId: string): string {
  return styleGuide.nodes.toolColors[toolId as keyof typeof styleGuide.nodes.toolColors] || '#6B7280';
}

// Utility to get mini variant styles (now uses unified sizing system)
export function getMiniNodeStyles(
  type: 'center' | 'peer' | 'tool', 
  nodeSize: 'small' | 'medium' | 'large' = 'medium'
): {
  container: string;
  inner: string;
  iconSize: string;
} {
  const sizeClass = styleGuide.nodes.size[nodeSize][type];
  const baseClass = type === 'tool' ? styleGuide.nodes.mini.base : styleGuide.nodes.mini.base;
  const innerClass = type === 'tool' 
    ? 'w-full h-full rounded-full bg-white border-2 flex items-center justify-center shadow-sm'
    : styleGuide.nodes.mini.inner;
  
  return {
    container: combineStyles(baseClass, sizeClass),
    inner: innerClass,
    iconSize: styleGuide.nodes.size[nodeSize].icon,
  };
}
