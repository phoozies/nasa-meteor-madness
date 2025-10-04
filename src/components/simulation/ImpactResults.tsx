import React from 'react';

interface ImpactData {
  energy: number; // Megatons TNT
  craterDiameter: number; // kilometers
  affectedArea: number; // square kilometers
  seismicMagnitude: number;
  tsunamiRisk: 'Low' | 'Medium' | 'High' | 'Extreme';
  casualties?: number;
}

interface ImpactResultsProps {
  impactData: ImpactData | null;
  isLoading?: boolean;
}

export default function ImpactResults({ impactData, isLoading = false }: ImpactResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!impactData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Run a simulation to see impact results</p>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(1);
  };

  const getTsunamiColor = (risk: string): string => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const results = [
    {
      title: 'Impact Energy',
      value: `${formatNumber(impactData.energy)} MT`,
      subtitle: 'TNT Equivalent',
      color: 'text-red-400',
      icon: '💥'
    },
    {
      title: 'Crater Diameter',
      value: `${impactData.craterDiameter.toFixed(1)} km`,
      subtitle: 'Impact Crater',
      color: 'text-orange-400',
      icon: '🕳️'
    },
    {
      title: 'Affected Area',
      value: `${formatNumber(impactData.affectedArea)} km²`,
      subtitle: 'Damage Zone',
      color: 'text-yellow-400',
      icon: '📍'
    },
    {
      title: 'Seismic Magnitude',
      value: impactData.seismicMagnitude.toFixed(1),
      subtitle: 'Richter Scale',
      color: 'text-purple-400',
      icon: '🌍'
    },
    {
      title: 'Tsunami Risk',
      value: impactData.tsunamiRisk,
      subtitle: 'Coastal Threat',
      color: getTsunamiColor(impactData.tsunamiRisk),
      icon: '🌊'
    },
    {
      title: 'Est. Casualties',
      value: impactData.casualties ? formatNumber(impactData.casualties) : 'N/A',
      subtitle: 'Population Impact',
      color: 'text-red-500',
      icon: '👥'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-200">{result.title}</h3>
              <span className="text-2xl">{result.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${result.color} mb-1`}>
              {result.value}
            </p>
            <p className="text-sm text-gray-400">{result.subtitle}</p>
          </div>
        ))}
      </div>
      
      {/* Additional info */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Impact Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-medium mb-2">Environmental Effects:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Atmospheric heating and fires</li>
              <li>• Debris ejection and fallout</li>
              <li>• Potential climate disruption</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Secondary Hazards:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Seismic activity and landslides</li>
              <li>• Tsunami generation (if oceanic)</li>
              <li>• Infrastructure damage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}