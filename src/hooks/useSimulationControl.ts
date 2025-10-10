'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EditorConfig, Node } from '@/types';
import { debateApi, SimulationRequest } from '@/lib/api';
import { agentsToConfigUpdate } from '@/lib/configUtils';

interface UseSimulationControlReturn {
  isRunning: boolean;
  isSaving: boolean;
  handleRun: (configuration: EditorConfig) => Promise<void>;
  handleSave: (configuration: EditorConfig, nodes: Node[]) => Promise<void>;
  canSave: (hasAgents: boolean) => boolean;
}

export function useSimulationControl(configId?: string): UseSimulationControlReturn {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleRun = useCallback(async (configuration: EditorConfig) => {
    console.log('Running simulation...');
    setIsRunning(true);

    try {
      // Build simulation request from current configuration
      const enabledAgents = configuration.agents.filter(a => a.enabled);
      
      // Validate we have agents
      if (enabledAgents.length === 0) {
        alert('Please add at least one agent to run a simulation.');
        setIsRunning(false);
        return;
      }

      // Validate agents have personalities
      const agentsWithoutPersonality = enabledAgents.filter(a => !a.personality || a.personality.trim() === '');
      if (agentsWithoutPersonality.length > 0) {
        const agentNames = agentsWithoutPersonality.map(a => a.name).join(', ');
        alert(`Please configure personality prompts for: ${agentNames}`);
        setIsRunning(false);
        return;
      }

      // Build simulation request using the baked agent state
      const simulationRequest: SimulationRequest = {
        topic: configuration.topic,
        agents: enabledAgents.map(a => ({
          name: a.name,
          profile: a.personality, // personality -> profile
          model_id: a.model_id || undefined
        })),
        max_iters: configuration.maxIterations,
        max_interventions_per_agent: configuration.maxInterventionsPerAgent,
        bias: enabledAgents.map(a => a.bias || 0),
        stance: "neutral",
        // Include config_id if we're editing an existing config
        config_id: configId,
      };

      // Create and start simulation
      console.log('Creating and starting simulation...');
      const createResponse = await debateApi.createSimulation(simulationRequest);
      console.log('Simulation created:', createResponse.simulation_id);

      // Redirect to simulation page
      router.push(`/simulation?id=${createResponse.simulation_id}`);
    } catch (error) {
      console.error('Error creating simulation:', error);
      alert(`Failed to create simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  }, [router, configId]);

  const handleSave = useCallback(async (configuration: EditorConfig, nodes: Node[]) => {
    if (!configId) {
      console.error('Cannot save: No config ID provided');
      return;
    }

    console.log('Saving configuration...');
    setIsSaving(true);

    try {
      const enabledAgents = configuration.agents.filter(a => a.enabled);

      // Log agents being saved
      console.log('Agents to be saved:', enabledAgents);
      
      
      // Build update request with canvas positions using utility function
      const updateRequest = {
        topic: configuration.topic,
        name: configuration.name,
        description: configuration.description,
        agents: agentsToConfigUpdate(enabledAgents, nodes),
        max_iters: configuration.maxIterations,
        max_interventions_per_agent: configuration.maxInterventionsPerAgent,
        bias: enabledAgents.map(a => a.bias || 0),
        stance: "neutral" // Could be configurable in the future
      };

      // Log agentsToConfigUpdate result
      console.log('agentsToConfigUpdate result:', updateRequest.agents);

      await debateApi.updateConfig(configId, updateRequest);
      console.log('Configuration saved successfully');
      
      // Optional: Show success feedback to user
      // Could dispatch a toast notification or similar here
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [configId]);

  const canSave = useCallback((hasAgents: boolean) => {
    // Can save if we have a config ID and at least one agent
    return !!configId && hasAgents;
  }, [configId]);

  return {
    isRunning,
    isSaving,
    handleRun,
    handleSave,
    canSave,
  };
}
