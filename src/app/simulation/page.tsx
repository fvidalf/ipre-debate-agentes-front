'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { debateApi } from '@/lib/api';

export default function SimulationPage() {
  const searchParams = useSearchParams();
  const simulationId = searchParams?.get('id');
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (simulationId) {
      loadSimulationData(simulationId);
    } else {
      setLoading(false);
    }
  }, [simulationId]);

  const loadSimulationData = async (id: string) => {
    try {
      setLoading(true);
      const data = await debateApi.getSimulation(id);
      setSimulationData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load simulation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">
            Loading simulation...
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error
          </h1>
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simulation Results
          </h1>
          {simulationId && (
            <p className="text-gray-700 text-sm">
              Simulation ID: {simulationId}
            </p>
          )}
        </div>

        {simulationData ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Topic</h2>
            <p className="text-gray-800 mb-6">{simulationData.topic}</p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Status: {simulationData.finished ? 'Completed' : 'In Progress'}
            </h2>
            <p className="text-gray-800 mb-6">
              Iterations: {simulationData.iters} / {simulationData.max_iters}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {simulationData.agents?.map((agent: any, index: number) => (
                <div key={agent.id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-800 mt-2">{agent.background}</p>
                  {agent.last_opinion && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-900">Last opinion:</span>
                      <p className="text-sm text-gray-800 mt-1">{agent.last_opinion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {simulationData.opiniones && simulationData.opiniones.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Debate Transcript</h2>
                <div className="space-y-4">
                  {simulationData.opiniones.map((opinion: string, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-purple-600">
                          {simulationData.intervenciones[index] || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-700">Turn {index + 1}</span>
                      </div>
                      <p className="text-gray-800">{opinion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No simulation data available
            </h2>
            <p className="text-gray-800">
              This page will show simulation results and progress.
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/debate'}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create New Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
