'use client'

import { VoteResponse, Config } from "@/lib/api";

interface VotingPanelProps {
    config?: Config;
    simulationId: string;
    simulationStatus: any;
    voteResults: VoteResponse | null;
    voteError: string | null;
    onVoteSimulation: () => void;
}

export default function VotingPanel({
    config,
    simulationId,
    simulationStatus,
    voteResults,
    voteError,
    onVoteSimulation,
}: VotingPanelProps) {

    return (
        <div className="flex flex-col h-full bg-[#f3f3f3]">
            {/* Header */}
            <div className="flex-shrink-0 p-6">
                <h2 className="text-2xl font-bold text-neutral-900">Voting</h2>
                <p className="text-neutral-700 text-sm mt-1">
                    {config?.name ? `Run of ${config.name}` : ''}
                </p>
            </div>

            {/* Error Banner */}
            {voteError && (
                <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">Failed to start voting</p>
                            <p className="text-sm">{voteError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* Vote Results */}
                    {voteResults && voteResults.individual_votes && voteResults.individual_votes.length > 0 ? (
                        <div className="space-y-6">
                            {/* Vote Summary */}
                            <div className="bg-white border border-neutral-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-neutral-900">Vote Summary</h3>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{voteResults.yea}</div>
                                            <div className="text-xs text-green-600 font-medium">YEA</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{voteResults.nay}</div>
                                            <div className="text-xs text-red-600 font-medium">NAY</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Individual Votes */}
                            <div className="space-y-3">
                            {voteResults.individual_votes.map((vote, index: number) => (
                                <div key={index} className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-sm font-medium ${vote.vote ? 'text-green-600' : 'text-red-600'}`}>
                                            {vote.agent_name}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            vote.vote 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {vote.vote ? 'YEA' : 'NAY'}
                                        </span>
                                    </div>
                                    <p className="text-neutral-900 mb-2 whitespace-pre-wrap break-words leading-relaxed">{vote.reasoning}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    ) : voteResults !== null ? (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center gap-2 text-neutral-600">
                                <span>No votes recorded</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="flex flex-col items-center gap-4 text-neutral-600">
                                <span>{voteError ? 'Voting failed - try again' : 'Ready to collect agent votes'}</span>
                                <button 
                                    onClick={onVoteSimulation}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {voteError ? 'Retry Voting' : 'Start Voting'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}