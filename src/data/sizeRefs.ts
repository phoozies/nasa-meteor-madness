/**
 * Reference objects for size comparison
 * Diameters are approximate and representative
 */

export type RefObject = {
  id: string;
  label: string;
  diameter_m: number;
  color?: string;
  category: 'living' | 'vehicle' | 'building' | 'natural';
  path?: string; // Optional SVG path for silhouette mode
  imageUrl?: string; // URL to the actual image/icon
  emoji?: string; // Fallback emoji representation
};

export const sizeReferences: RefObject[] = [
  // Living things
  {
    id: 'human',
    label: 'Human',
    diameter_m: 1.7,
    color: '#8b5cf6',
    category: 'living',
    emoji: '🧍',
    imageUrl: '/svgs/human.png',
  },
  {
    id: 't-rex',
    label: 'T-Rex',
    diameter_m: 4,
    color: '#84cc16',
    category: 'living',
    emoji: '🦖',
    imageUrl: '/svgs/trex.png',
  },
  {
    id: 'blue-whale',
    label: 'Blue Whale',
    diameter_m: 7.5,
    color: '#06b6d4',
    category: 'living',
    emoji: '🐋',
    imageUrl: '/svgs/blue-whale-shape.svg',
  },
  
  // Vehicles
  {
    id: 'car',
    label: 'Car',
    diameter_m: 1.8,
    color: '#64748b',
    category: 'vehicle',
    emoji: '🚗',
    imageUrl: '/svgs/Car_pictogram.svg',
  },
  {
    id: 'bus',
    label: 'Bus',
    diameter_m: 2.5,
    color: '#f59e0b',
    category: 'vehicle',
    emoji: '🚌',
    imageUrl: '/svgs/Anonymous-Bus-symbol-black.png',
  },
  {
    id: 'boeing-747',
    label: 'Boeing 747',
    diameter_m: 70,
    color: '#3b82f6',
    category: 'vehicle',
    emoji: '✈️',
    imageUrl: '/svgs/Boeing-747-brut.png',
  },
  
  // Buildings & Structures
  {
    id: 'house',
    label: 'House',
    diameter_m: 10,
    color: '#eab308',
    category: 'building',
    emoji: '🏠',
    imageUrl: '/svgs/Small_SVG_house_icon.svg',
  },
  {
    id: 'statue-liberty',
    label: 'Statue of Liberty',
    diameter_m: 46,
    color: '#22c55e',
    category: 'building',
    emoji: '🗽',
    imageUrl: '/svgs/the-statue-of-liberty.svg',
  },
  {
    id: 'football-field',
    label: 'Football Field',
    diameter_m: 110,
    color: '#10b981',
    category: 'building',
    emoji: '🏟️',
    imageUrl: '/svgs/football-gridiron.png',
  },
  {
    id: 'stadium',
    label: 'Stadium',
    diameter_m: 200,
    color: '#ef4444',
    category: 'building',
    emoji: '🏟️',
    imageUrl: '/svgs/Stadium.svg',
  },
  {
    id: 'eiffel-tower',
    label: 'Eiffel Tower',
    diameter_m: 330,
    color: '#f97316',
    category: 'building',
    emoji: '🗼',
    imageUrl: '/svgs/Eiffel-Tower-Silhouette.png',
  },
  {
    id: 'burj-khalifa',
    label: 'Burj Khalifa',
    diameter_m: 828,
    color: '#dc2626',
    category: 'building',
    emoji: '🏢',
    imageUrl: '/svgs/burj.png',
  },
  
  // Natural features
  {
    id: 'meteor-crater',
    label: 'Meteor Crater (Arizona)',
    diameter_m: 1200,
    color: '#78716c',
    category: 'natural',
    emoji: '🕳️',
  },
];

export const categoryLabels: Record<RefObject['category'], string> = {
  living: 'Living Things',
  vehicle: 'Vehicles',
  building: 'Buildings & Structures',
  natural: 'Natural Features',
};

export const getCategoryColor = (category: RefObject['category']): string => {
  switch (category) {
    case 'living':
      return '#8b5cf6';
    case 'vehicle':
      return '#3b82f6';
    case 'building':
      return '#f59e0b';
    case 'natural':
      return '#78716c';
    default:
      return '#64748b';
  }
};
