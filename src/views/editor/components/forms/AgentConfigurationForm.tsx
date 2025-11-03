'use client';

import { Agent } from '@/types';
import { ModelInfo } from '@/lib/api';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface AgentConfigurationFormProps {
  agent: Agent;
  availableModels: ModelInfo[];
  defaultModel: string;
  modelsLoading: boolean;
  onUpdate: (agentId: string, updates: Partial<Agent>) => void;
  onRemove: (agentId: string) => void;
  onClose: () => void;
}

export default function AgentConfigurationForm({
  agent,
  availableModels,
  defaultModel,
  modelsLoading,
  onUpdate,
  onRemove,
  onClose,
}: AgentConfigurationFormProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Back button - fixed at top */}
      <div className="flex-shrink-0 mb-4">
        <button
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Back to general settings
        </button>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Agent name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agent Name
          </label>
          <Input
            value={agent.name}
            onChange={(e) => onUpdate(agent.id, { name: e.target.value })}
            placeholder="Enter agent name"
          />
        </div>

        {/* AI Model selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          {modelsLoading ? (
            <div className="text-sm text-gray-500 italic">
              Loading models...
            </div>
          ) : (
            <select
              value={agent.model_id || ''}
              onChange={(e) =>
                onUpdate(agent.id, {
                  model_id: e.target.value || undefined,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Use Default ({defaultModel})</option>
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          )}
          {!modelsLoading && availableModels.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {agent.model_id
                ? availableModels.find((m) => m.id === agent.model_id)
                    ?.description
                : `Using default model: ${defaultModel}`}
            </p>
          )}
        </div>

        {/* Personality prompt - main configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personality Prompt
          </label>
          <Textarea
            value={agent.personality}
            onChange={(e) =>
              onUpdate(agent.id, { personality: e.target.value })
            }
            placeholder="Describe this agent's personality, beliefs, and debate style..."
            rows={8}
            className="w-full"
          />
        </div>

        {/* LM Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Model Parameters
            {agent.model_id ? (
              <span className="text-sm font-normal text-gray-500">
                {' '}(
                {availableModels.find((m) => m.id === agent.model_id)?.name ||
                  agent.model_id}
                )
              </span>
            ) : (
              <span className="text-sm font-normal text-gray-500">
                {' '}({defaultModel})
              </span>
            )}
          </label>
          <div className="space-y-5 bg-gray-50 p-5 rounded-lg">
            {/* Temperature */}
            <ParameterSlider
              label="Temperature"
              value={agent.lm_config?.temperature ?? 0.7}
              min={0}
              max={2}
              step={0.1}
              minLabel="Focused (0.0)"
              maxLabel="Creative (2.0)"
              onChange={(value) =>
                onUpdate(agent.id, {
                  lm_config: { ...agent.lm_config, temperature: value },
                })
              }
            />

            {/* Max Tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max="4096"
                  value={agent.lm_config?.max_tokens ?? ''}
                  placeholder="Auto"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onUpdate(agent.id, {
                      lm_config: {
                        ...agent.lm_config,
                        max_tokens: isNaN(value) ? undefined : value,
                      },
                    });
                  }}
                  className="w-24 px-3 py-1 border border-gray-300 rounded bg-white text-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                Maximum length of agent responses
              </p>
            </div>

            {/* Top P */}
            <ParameterSlider
              label="Top P"
              value={agent.lm_config?.top_p ?? 0.9}
              min={0}
              max={1}
              step={0.05}
              minLabel="Precise (0.0)"
              maxLabel="Diverse (1.0)"
              onChange={(value) =>
                onUpdate(agent.id, {
                  lm_config: { ...agent.lm_config, top_p: value },
                })
              }
            />

            {/* Frequency Penalty */}
            <ParameterSlider
              label="Frequency Penalty"
              value={agent.lm_config?.frequency_penalty ?? 0}
              min={-2}
              max={2}
              step={0.1}
              minLabel="Repetitive (-2.0)"
              maxLabel="Varied (2.0)"
              onChange={(value) =>
                onUpdate(agent.id, {
                  lm_config: {
                    ...agent.lm_config,
                    frequency_penalty: value,
                  },
                })
              }
            />

            {/* Presence Penalty */}
            <ParameterSlider
              label="Presence Penalty"
              value={agent.lm_config?.presence_penalty ?? 0}
              min={-2}
              max={2}
              step={0.1}
              minLabel="Same topics (-2.0)"
              maxLabel="New topics (2.0)"
              onChange={(value) =>
                onUpdate(agent.id, {
                  lm_config: { ...agent.lm_config, presence_penalty: value },
                })
              }
            />

            {/* Reset button */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => onUpdate(agent.id, { lm_config: undefined })}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </div>

        {/* Bias slider */}
        <ParameterSlider
          label="Bias"
          value={agent.bias || 0}
          min={0}
          max={1}
          step={0.05}
          minLabel="Neutral (0.0)"
          maxLabel="Strong (1.0)"
          onChange={(value) => onUpdate(agent.id, { bias: value })}
        />

        {/* Remove agent button - at the end */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onRemove(agent.id)}
            className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium"
          >
            Remove Agent
          </button>
        </div>
      </div>
    </div>
  );
}

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
}: ParameterSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
          {value.toFixed(value === Math.round(value) ? 0 : 2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
