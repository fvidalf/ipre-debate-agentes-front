'use client'

import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { AnalyticsItem, AnalyticsType } from '@/lib/api';

// ========================================================================================
// ENGAGEMENT MATRIX VISUALIZATION
// ========================================================================================

interface EngagementMatrixProps {
  data: number[][];
  metadata: {
    agent_names?: string[];
    turn_count?: number;
    legend?: {
      "0": string;
      "1": string;
      "2": string;
    };
  };
}

export const EngagementMatrix = ({ data, metadata }: EngagementMatrixProps) => {
  // Transform data for Nivo HeatMap
  const nivoData = data.map((row, agentIndex) => ({
    id: metadata.agent_names?.[agentIndex] || `Agent ${agentIndex + 1}`,
    data: row.map((value, turnIndex) => ({
      x: `T${turnIndex + 1}`,
      y: value
    }))
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveHeatMap
        data={nivoData}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        valueFormat=">-.0f"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Debate Turns',
          legendOffset: -50
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Agents',
          legendPosition: 'middle',
          legendOffset: -70
        }}
        colors={{
          type: 'quantize',
          colors: ['#e8f4fd', '#74c0fc', '#339af0'] // Light blue to dark blue
        }}
        emptyColor="#f8f9fa"
        borderColor="#ffffff"
        borderWidth={2}
        labelTextColor="#000000"
        tooltip={({ cell }) => (
          <div className="bg-white p-2 shadow-lg rounded border">
            <strong>{cell.serieId}</strong> at <strong>{cell.data.x}</strong>
            <br />
            Status: <strong>{getEngagementStatus(cell.data.y, metadata.legend)}</strong>
          </div>
        )}
      />
    </div>
  );
};

// ========================================================================================
// PARTICIPATION STATISTICS VISUALIZATION
// ========================================================================================

interface ParticipationStatsProps {
  data: {
    total_interventions: Record<string, number>;
    total_engagements: Record<string, number>;
    engagement_rates: Record<string, number>;
    participation_percentages: Record<string, number>;
    total_turns: number;
  };
  metadata: {
    agent_names?: string[];
  };
}

export const ParticipationStats = ({ data, metadata }: ParticipationStatsProps) => {
  // Bar chart data for interventions
  const interventionData = Object.entries(data.total_interventions).map(([name, value]) => ({
    agent: name,
    interventions: value,
    engagements: data.total_engagements[name] || 0
  }));

  // Pie chart data for participation percentages
  const participationData = Object.entries(data.participation_percentages).map(([name, value]) => ({
    id: name,
    label: name,
    value: value
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Interventions Bar Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4 text-center">Interventions vs Engagements</h4>
        <div className="h-64">
          <ResponsiveBar
            data={interventionData}
            keys={['interventions', 'engagements']}
            indexBy="agent"
            margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#339af0', '#74c0fc']}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: 50,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20
              }
            ]}
          />
        </div>
      </div>

      {/* Participation Percentages Pie Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4 text-center">Speaking Time Distribution</h4>
        <div className="h-64">
          <ResponsivePie
            data={participationData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: 'blues' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            valueFormat=".1f"
          />
        </div>
      </div>
    </div>
  );
};

// ========================================================================================
// OPINION SIMILARITY MATRIX VISUALIZATION
// ========================================================================================

interface OpinionSimilarityProps {
  data: any; 
  metadata: {
    agent_names?: string[];
    speaking_agents?: string[];
    similarity_range?: { min: number; max: number };
    note?: string;
  };
}

export const OpinionSimilarity = ({ data, metadata }: OpinionSimilarityProps) => {
  const matrix = data.matrix || data; // Support both new and old formats
  const agentNames = metadata.speaking_agents || metadata.agent_names || [];
  
  // Transform data for Nivo HeatMap (symmetric matrix)
  const nivoData = matrix.map((row: number[], agentIndex: number) => ({
    id: agentNames[agentIndex] || `Agent ${agentIndex + 1}`,
    data: row.map((value, columnIndex) => ({
      x: agentNames[columnIndex] || `Agent ${columnIndex + 1}`,
      y: value
    }))
  }));

  return (
    <div className="w-full">
      <div className="h-96">
        <ResponsiveHeatMap
          data={nivoData}
          margin={{ top: 60, right: 20, bottom: 60, left: 80 }}
          valueFormat=".2f"
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0
          }}
          colors={{
            type: 'diverging',
            scheme: 'red_yellow_blue',
            divergeAt: 0.5,
            minValue: 0,
            maxValue: 1
          }}
          emptyColor="#f8f9fa"
          borderColor="#ffffff"
          borderWidth={2}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.8]]
          }}
          tooltip={({ cell }) => (
            <div className="bg-white p-2 shadow-lg rounded border">
              <strong>{cell.serieId}</strong> ↔ <strong>{cell.data.x}</strong>
              <br />
              Similarity: <strong>{((cell.data.y as number) * 100).toFixed(1)}%</strong>
            </div>
          )}
        />
      </div>
      {metadata.note && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">
          {metadata.note}
        </p>
      )}
    </div>
  );
};

// ========================================================================================
// MAIN ANALYTICS RENDERER
// ========================================================================================

interface AnalyticsRendererProps {
  analytics: AnalyticsItem[];
}

export const AnalyticsRenderer = ({ analytics }: AnalyticsRendererProps) => {
  const renderAnalyticsItem = (item: AnalyticsItem) => {
    switch (item.type) {
      case AnalyticsType.EngagementMatrixType:
        return <EngagementMatrix data={item.data} metadata={item.metadata} />;
      
      case AnalyticsType.ParticipationStatsType:
        return <ParticipationStats data={item.data} metadata={item.metadata} />;
      
      case AnalyticsType.OpinionSimilarityType:
        return <OpinionSimilarity data={item.data} metadata={item.metadata} />;
      
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Unknown analytics type: <code className="bg-yellow-100 px-1 rounded">{item.type}</code>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {analytics.map((item, index) => (
        <div key={`${item.type}-${index}`} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
            <p className="text-gray-600 mt-1">{item.description}</p>
          </div>
          
          <div className="analytics-visualization">
            {renderAnalyticsItem(item)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

const getEngagementStatus = (value: number, legend?: Record<string, string>): string => {
  const defaultLegend: Record<string, string> = { '0': 'inactive', '1': 'engaged', '2': 'speaking' };
  const useLegend = legend || defaultLegend;
  return useLegend[value.toString()] || 'unknown';
};