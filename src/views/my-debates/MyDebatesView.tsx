'use client';

import { Plus } from 'lucide-react';
import { useConfigs } from '@/hooks/useConfigs';
import DebateItem from './components/DebateItem';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { debateApi } from '@/lib/api';
import { useState } from 'react';

export default function MyDebatesView() {
  const router = useRouter();
  const [creatingConfig, setCreatingConfig] = useState(false);
  const {
    configs,
    loading,
    error,
    selectedConfigId,
    selectedConfigRuns,
    runsLoading,
    expandedConfigs,
    toggleConfig,
    refreshConfigs,
  } = useConfigs();

  const handleCreateNewDebate = async () => {
    try {
      setCreatingConfig(true);
      // Create a blank config via API
      const newConfig = await debateApi.createConfig();
      // Refresh the configs list to include the new config
      await refreshConfigs();
      // Redirect to the editor with the new config ID
      router.push(`/editor/${newConfig.id}`);
    } catch (error) {
      console.error('Failed to create new debate config:', error);
      // Fallback to creating without config ID
      router.push('/editor');
    } finally {
      setCreatingConfig(false);
    }
  };

  const handleDeleteConfig = async (configId: string, configName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${configName}"?\n\nThis will permanently delete the debate configuration and ALL associated simulation runs. This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await debateApi.deleteConfig(configId);
        // Refresh the configs list to remove the deleted config
        await refreshConfigs();
      } catch (error) {
        console.error('Failed to delete config:', error);
        alert('Failed to delete the debate configuration. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3]">
        {/* Header */}
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Debates</h1>
                <p className="text-gray-600 mt-1">Manage and run your debate configurations</p>
              </div>
              <Button
                disabled={true}
                className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Debate
              </Button>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading debates...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Debates</h1>
              <p className="text-gray-600 mt-1">Manage and run your debate configurations</p>
            </div>
            <Button
              onClick={handleCreateNewDebate}
              disabled={creatingConfig}
              className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              {creatingConfig ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Debate
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium mb-2">Error loading debates</h3>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <Button
              onClick={refreshConfigs}
              className="bg-red-600 text-white hover:bg-red-700 text-sm px-3 py-1"
            >
              Try again
            </Button>
          </div>
        ) : null}

        {configs.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No debates yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first debate configuration to get started with AI-powered discussions.
              </p>
              <Button
                onClick={handleCreateNewDebate}
                disabled={creatingConfig}
                className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 mx-auto"
              >
                {creatingConfig ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create your first debate
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {configs.map((config) => (
              <DebateItem
                key={config.id}
                configId={config.id}
                initialConfig={config}
                runs={selectedConfigId === config.id ? selectedConfigRuns : []}
                runsLoading={selectedConfigId === config.id && runsLoading}
                isExpanded={expandedConfigs.has(config.id)}
                onToggle={() => toggleConfig(config.id)}
                onDelete={handleDeleteConfig}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
