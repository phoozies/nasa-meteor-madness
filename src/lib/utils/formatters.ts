/**
 * Utility functions for formatting and displaying data
 */

/**
 * Format large numbers with appropriate units (K, M, B)
 */
export function formatLargeNumber(num: number, precision = 1): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e12) {
    return `${sign}${(absNum / 1e12).toFixed(precision)}T`;
  }
  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(precision)}B`;
  }
  if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(precision)}M`;
  }
  if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(precision)}K`;
  }
  
  return `${sign}${absNum.toFixed(precision)}`;
}

/**
 * Format distances with appropriate units
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)} m`;
  }
  if (distanceKm < 100) {
    return `${distanceKm.toFixed(1)} km`;
  }
  if (distanceKm < 1000) {
    return `${distanceKm.toFixed(0)} km`;
  }
  
  return formatLargeNumber(distanceKm) + ' km';
}

/**
 * Format velocity with units
 */
export function formatVelocity(velocityKmS: number): string {
  return `${velocityKmS.toFixed(1)} km/s`;
}

/**
 * Format energy values
 */
export function formatEnergy(energyJoules: number): string {
  const tntEquivalent = energyJoules / 4.184e15; // Megatons TNT
  
  if (tntEquivalent < 0.001) {
    return `${(tntEquivalent * 1000).toFixed(1)} kt TNT`;
  }
  
  return `${formatLargeNumber(tntEquivalent)} MT TNT`;
}

/**
 * Format mass with appropriate units
 */
export function formatMass(massKg: number): string {
  if (massKg < 1000) {
    return `${massKg.toFixed(1)} kg`;
  }
  if (massKg < 1e6) {
    return `${(massKg / 1000).toFixed(1)} tonnes`;
  }
  if (massKg < 1e9) {
    return `${(massKg / 1e6).toFixed(1)} kt`;
  }
  
  return `${formatLargeNumber(massKg / 1e9)} Mt`;
}

/**
 * Format dates for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format coordinates
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

/**
 * Format magnitude with appropriate precision
 */
export function formatMagnitude(magnitude: number): string {
  return magnitude.toFixed(1);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, precision = 1): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Format time durations
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365.25);
  
  if (years > 0) {
    return `${years}y ${days % 365}d`;
  }
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  return `${minutes}m ${seconds % 60}s`;
}

/**
 * Color coding for risk levels
 */
export function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-orange-400';
    case 'extreme':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get background color for risk levels
 */
export function getRiskBackgroundColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'bg-green-600/20';
    case 'medium':
      return 'bg-yellow-600/20';
    case 'high':
      return 'bg-orange-600/20';
    case 'extreme':
      return 'bg-red-600/20';
    default:
      return 'bg-gray-600/20';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}