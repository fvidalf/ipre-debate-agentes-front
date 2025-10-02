'use client'

import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { AnalyticsType, AnalyticsItem } from '@/lib/api';

interface VisualizationRendererProps {
  analytics: AnalyticsItem[];
  selectedViz: AnalyticsType | null;
}

export default function VisualizationRenderer({ analytics, selectedViz }: VisualizationRendererProps) {
  if (!selectedViz || !analytics) {
    return (
      <div className="h-full bg-white border border-neutral-200 flex items-center justify-center rounded-lg shadow-sm">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium">Select a visualization</p>
          <p className="text-sm">Choose from the analytics panel to view data</p>
        </div>
      </div>
    );
  }

  const selectedAnalytics = analytics.find(item => item.type === selectedViz);
  
  if (!selectedAnalytics) {
    return (
      <div className="h-full bg-white border border-neutral-200 flex items-center justify-center rounded-lg shadow-sm">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg font-medium">Visualization not found</p>
          <p className="text-sm">The selected visualization is not available</p>
        </div>
      </div>
    );
  }

  const renderVisualization = () => {
    switch (selectedViz) {
      case AnalyticsType.EngagementMatrixType:
        return <EngagementMatrixViz data={selectedAnalytics.data} metadata={selectedAnalytics.metadata} />;
      
      case AnalyticsType.ParticipationStatsType:
        return <ParticipationStatsViz data={selectedAnalytics.data} metadata={selectedAnalytics.metadata} />;
      
      case AnalyticsType.OpinionSimilarityType:
        return <OpinionSimilarityViz data={selectedAnalytics.data} metadata={selectedAnalytics.metadata} />;
      
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Unknown visualization type: {selectedViz}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white border border-neutral-200 rounded-lg shadow-sm p-4 overflow-hidden">
      {renderVisualization()}
    </div>
  );
}

// ========================================================================================
// INDIVIDUAL VISUALIZATION COMPONENTS
// ========================================================================================

const EngagementMatrixViz = ({ data, metadata }: { data: number[][], metadata: any }) => {
  const nivoData = data.map((row, agentIndex) => ({
    id: metadata.agent_names?.[agentIndex] || `Agent ${agentIndex + 1}`,
    data: row.map((value, turnIndex) => ({
      x: `T${turnIndex + 1}`,
      y: value
    }))
  }));

  // Performance optimization: disable labels for large matrices
  const totalCells = data.length * (data[0]?.length || 0);
  const showLabels = totalCells <= 50; // Show labels only for smaller matrices

  // Custom color mapping for engagement levels
  const getEngagementColor = (value: number) => {
    switch (value) {
      case 0: return '#f3f4f6'; // Light gray for inactive
      case 1: return '#c084fc'; // Light purple for engaged
      case 2: return '#9333ea'; // Main purple for speaking
      default: return '#f3f4f6';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Legend */}
      <div className="flex justify-center mb-4 space-x-6 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
          <span className="text-sm font-medium text-gray-700">Inactive</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#c084fc' }}></div>
          <span className="text-sm font-medium text-gray-700">Engaged</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9333ea' }}></div>
          <span className="text-sm font-medium text-gray-700">Speaking</span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveHeatMap
          data={nivoData}
          margin={{ top: 120, right: 80, bottom: 120, left: 160 }}
          valueFormat=">-.0f"
          axisTop={{
            tickSize: 10,
            tickPadding: 16,
            tickRotation: 0,
            legend: 'Debate Turns',
            legendOffset: -50,
            legendPosition: 'middle',
            format: (value) => value
          }}
          axisLeft={{
            tickSize: 10,
            tickPadding: 16,
            tickRotation: 0,
            format: (value) => value.length > 15 ? value.substring(0, 15) + '...' : value
            // Removed 'Agents' legend to prevent clash with agent names
          }}
          colors={(cell) => getEngagementColor(cell.data.y)}
          emptyColor="#f9fafb"
          borderColor="#ffffff"
          borderWidth={2}
          labelTextColor="#1f2937"
          enableLabels={showLabels}
          theme={{
            labels: {
              text: {
                fontSize: showLabels ? 14 : 12,
                fontWeight: 600
              }
            },
            axis: {
              ticks: {
                text: {
                  fontSize: 14,
                  fontWeight: 500
                }
              },
              legend: {
                text: {
                  fontSize: 16,
                  fontWeight: 600
                }
              }
            }
          }}
          tooltip={({ cell }) => (
            <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200">
              <div className="font-semibold text-lg text-purple-700 mb-1">{cell.serieId}</div>
              <div className="text-sm text-gray-600 mb-2">{cell.data.x}</div>
              <div className="text-sm">
                Status: <span className="font-medium text-purple-600 capitalize">{getEngagementStatus(cell.data.y, metadata.legend)}</span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

const ParticipationStatsViz = ({ data, metadata }: { data: any, metadata: any }) => {
  // Bar chart data for interventions vs engagements
  const interventionData = Object.entries(data.total_interventions).map(([name, value]) => ({
    agent: name,
    interventions: value as number,
    engagements: (data.total_engagements[name] as number) || 0
  }));

  // Pie chart data for participation percentages
  const participationData = Object.entries(data.participation_percentages).map(([name, value]) => ({
    id: name,
    label: name,
    value: value as number
  }));

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Interventions Bar Chart */}
      <div className="flex-1">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Interventions vs Engagements</h4>
        <div className="h-full">
          <ResponsiveBar
            data={interventionData}
            keys={['interventions', 'engagements']}
            indexBy="agent"
            margin={{ top: 30, right: 140, bottom: 80, left: 80 }}
            padding={0.4}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#9333ea', '#f59e0b']} // Purple for interventions, amber for engagements
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 8,
              tickPadding: 12,
              tickRotation: 0,
              format: (value) => value.length > 12 ? value.substring(0, 12) + '...' : value
            }}
            axisLeft={{
              tickSize: 8,
              tickPadding: 12,
              tickRotation: 0,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: -50
            }}
            labelSkipWidth={8}
            labelSkipHeight={8}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 14,
                    fontWeight: 500
                  }
                },
                legend: {
                  text: {
                    fontSize: 16,
                    fontWeight: 600
                  }
                }
              },
              labels: {
                text: {
                  fontSize: 12,
                  fontWeight: 600
                }
              }
            }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 8,
                itemWidth: 100,
                itemHeight: 24,
                itemDirection: 'left-to-right',
                itemOpacity: 0.9,
                symbolSize: 16,
                itemTextColor: '#374151'
              }
            ]}
          />
        </div>
      </div>

      {/* Participation Percentages Pie Chart */}
      <div className="flex-1">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Speaking Time Distribution</h4>
        <div className="h-full">
          <ResponsivePie
            data={participationData}
            margin={{ top: 40, right: 120, bottom: 80, left: 120 }}
            innerRadius={0.4}
            padAngle={1}
            cornerRadius={4}
            activeOuterRadiusOffset={12}
            colors={['#9333ea', '#f59e0b', '#ef4444', '#10b981', '#06b6d4']} // Distinct colors for different agents
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            arcLinkLabelsSkipAngle={8}
            arcLinkLabelsTextColor="#374151"
            arcLinkLabelsThickness={3}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={8}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            valueFormat=".1f"
            theme={{
              labels: {
                text: {
                  fontSize: 14,
                  fontWeight: 600
                }
              }
            }}
            tooltip={({ datum }) => (
              <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200">
                <div className="font-semibold text-lg mb-1" style={{ color: datum.color }}>{datum.label}</div>
                <div className="text-sm text-gray-700">
                  Speaking Time: <span className="font-medium">{datum.value.toFixed(1)}%</span>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

const OpinionSimilarityViz = ({ data, metadata }: { data: number[][], metadata: any }) => {
  // Filter data to show only upper triangle and diagonal (hide bottom-left triangle)
  const nivoData = data.map((row, agentIndex) => {
    // Only include data points where agentIndex <= columnIndex (upper triangle + diagonal)
    const filteredData = row
      .map((value, columnIndex) => ({
        x: metadata.agent_names?.[columnIndex] || `Agent ${columnIndex + 1}`,
        y: value
      }))
      .filter((_, columnIndex) => agentIndex <= columnIndex);
    
    return {
      id: metadata.agent_names?.[agentIndex] || `Agent ${agentIndex + 1}`,
      data: filteredData
    };
  }).filter(series => series.data.length > 0); // Remove empty series

  // Check if matrix is small enough for numeric labels (accessibility)
  const totalCells = nivoData.reduce((sum, series) => sum + series.data.length, 0);
  const showNumericLabels = totalCells <= 25; // Show labels for small matrices only

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Viridis Gradient Legend - Consistent styling with engagement matrix */}
      <div className="flex justify-center mb-4 space-x-6 flex-shrink-0">
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-gray-700">0% Similar</span>
          <div className="flex flex-col items-center">
            <div className="w-48 h-4 rounded border border-gray-300" style={{
              background: 'linear-gradient(to right, rgb(68,1,84) 0%, rgb(72,40,120) 20%, rgb(62,74,137) 40%, rgb(49,104,142) 60%, rgb(53,183,121) 80%, rgb(253,231,37) 100%)'
            }}></div>
            <div className="flex justify-between w-48 mt-1 text-xs text-gray-500">
              <span>0</span>
              <span>0.2</span>
              <span>0.4</span>
              <span>0.6</span>
              <span>0.8</span>
              <span>1</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">100% Similar</span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveHeatMap
          data={nivoData}
          margin={{ top: 120, right: 80, bottom: 120, left: 160 }}
          valueFormat=".2f"
          axisTop={{
            tickSize: 10,
            tickPadding: 16,
            tickRotation: 0,
            format: (value) => value.length > 15 ? value.substring(0, 15) + '...' : value
          }}
          axisLeft={{
            tickSize: 10,
            tickPadding: 16,
            tickRotation: 0,
            format: (value) => value.length > 15 ? value.substring(0, 15) + '...' : value
            // Removed legend to prevent clash with agent names
          }}
          colors={{
            type: 'sequential',
            scheme: 'viridis',
            minValue: 0,
            maxValue: 1
          }}
          emptyColor="#f8fafc"
          borderColor="#ffffff"
          borderWidth={2}
          labelTextColor="#1f2937"
          enableLabels={showNumericLabels}
          label={showNumericLabels ? (d) => `${((d.value as number) * 100).toFixed(0)}%` : undefined}
          theme={{
            labels: {
              text: {
                fontSize: showNumericLabels ? 12 : 14,
                fontWeight: 600
              }
            },
            axis: {
              ticks: {
                text: {
                  fontSize: 14,
                  fontWeight: 500
                }
              }
            }
          }}
          tooltip={({ cell }) => (
            <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200">
              <div className="font-semibold text-lg text-purple-700 mb-1">{cell.serieId} ↔ {cell.data.x}</div>
              <div className="text-sm">
                Similarity: <span className="font-medium text-purple-600">{((cell.data.y as number) * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

// Utility function
const getEngagementStatus = (value: number, legend?: Record<string, string>): string => {
  const defaultLegend: Record<string, string> = { '0': 'inactive', '1': 'engaged', '2': 'speaking' };
  const useLegend = legend || defaultLegend;
  return useLegend[value.toString()] || 'unknown';
};