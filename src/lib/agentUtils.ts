import { AgentTemplate } from '@/lib/api';
import { Agent } from '@/types';

// Utility function to generate unique IDs (copied from useDebateApp for consistency)
const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

// Convert AgentTemplate from API to Agent format used in the app
export function convertTemplateToAgent(
  template: AgentTemplate, 
  nodeId: string
): Agent {
  return {
    id: `agent-${generateUniqueId()}`,
    name: template.name,
    nodeId,
    personality: template.config.background,
    bias: template.config.bias,
    enabled: true,
    model_id: template.config.model,
  };
}

// Generate colors for agent templates (fallback for when API doesn't provide colors)
const templateColors = [
  '#DC2626', // Red
  '#059669', // Green
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#0891B2', // Cyan
  '#C2410C', // Amber
  '#BE185D', // Pink
];

export function getTemplateColor(templateId: string): string {
  // Use a simple hash of the template ID to consistently assign colors
  const hash = templateId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % templateColors.length;
  return templateColors[index];
}
