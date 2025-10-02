'use client'

import { AnalyticsResponse, AnalyticsType, Config } from "@/lib/api";

interface AnalyticsPanelProps {
    config?: Config;
    analyticsResults: AnalyticsResponse | null;
    analyticsLoading: boolean;
    analyticsError: string | null;
    onAnalyzeSimulation: () => void;
    selectedViz: AnalyticsType | null;
    setSelectedViz: (viz: AnalyticsType | null) => void;
}

export default function AnalyticsPanel({
    config,
    analyticsResults,
    analyticsLoading,
    analyticsError,
    onAnalyzeSimulation,
    selectedViz,
    setSelectedViz
}: AnalyticsPanelProps) {
    return (
        <div className="flex flex-col h-full bg-[#f3f3f3]">
            {/* Header */}
            <div className="flex-shrink-0 p-6">
                <h2 className="text-2xl font-bold text-neutral-900">Analytics</h2>
                <p className="text-neutral-700 text-sm mt-1">
                    {config?.name ? `Run of ${config.name}` : ''}
                </p>
            </div>

            {/* Error Banner */}
            {analyticsError && (
                <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">Failed to fetch analytics</p>
                            <p className="text-sm">{analyticsError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* Loading State */}
                    {analyticsLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                            <span className="ml-2 text-sm text-neutral-500">Loading votes...</span>
                        </div>
                    )}

                    {/* Visualization options */}
                    {!analyticsLoading && analyticsResults && analyticsResults.analytics.length > 0 ? (
                        <div className="space-y-3">
                            {/* Map out options */}
                            {analyticsResults.analytics.map((item, index: number) => (
                                <button
                                    key={index}
                                    className="w-full bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition-all text-left"
                                    onClick={() => setSelectedViz && setSelectedViz(item.type)}
                                >
                                    <span className="text-lg font-semibold text-neutral-900">{item.title}</span>
                                    <p className="text-sm text-neutral-600 mt-1">{item.description}</p>

                                </button>

                            ))}

                        </div>
                    ) : !analyticsLoading && analyticsResults !== null ? (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center gap-2 text-neutral-600">
                                <span>No votes recorded</span>
                            </div>
                        </div>
                    ) : !analyticsLoading ? (
                        <div className="text-center py-8">
                            <div className="flex flex-col items-center gap-4 text-neutral-600">
                                <span>{analyticsError ? 'Analysis failed - try again' : 'Ready to analyze simulation'}</span>
                                <button 
                                    onClick={onAnalyzeSimulation}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {analyticsError ? 'Retry Analysis' : 'Analyze Simulation'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

