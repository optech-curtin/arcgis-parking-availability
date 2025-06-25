// Map utility functions
export function getVacancyColor(percentage: number): string {
  if (percentage >= 50) return '#10B981'; // Green - plenty
  if (percentage >= 20) return '#F59E0B'; // Yellow - limited  
  return '#EF4444'; // Red - almost full
}

export function cleanParkingLotName(name: string): string {
  if (!name) return '';
  
  // Remove zero-width spaces and other invisible characters
  const cleanedName = name
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
    .replace(/[\u00AD]/g, '') // Soft hyphen
    .replace(/[\u2060]/g, '') // Word joiner
    .replace(/[\u2061]/g, '') // Function application
    .replace(/[\u2062]/g, '') // Invisible times
    .replace(/[\u2063]/g, '') // Invisible separator
    .replace(/[\u2064]/g, '') // Invisible plus
    .replace(/[\u200E\u200F]/g, '') // Left-to-right and right-to-left marks
    .replace(/[\u202A-\u202E]/g, '') // Directional formatting characters
    .replace(/[\u2066-\u2069]/g, '') // Directional isolate characters
    .replace(/[\uFFF9-\uFFFB]/g, '') // Interlinear annotation characters
    .replace(/[\u2028\u2029]/g, '') // Line and paragraph separators
    .trim(); // Remove leading/trailing whitespace
  
  // Normalize whitespace (replace multiple spaces with single space)
  const normalizedName = cleanedName.replace(/\s+/g, ' ');
  
  return normalizedName;
}

// Manual exclusion list for specific parking lots
export const EXCLUDED_PARKING_LOTS = ['B418', 'PL2'];

// Parking data structure for current and future API integration
export interface ParkingData {
  zone: string;
  vacant: number;
  total: number;
  vacantPercentage: number;
  lastUpdated: Date;
}

// Generate random parking data (to be replaced with API call)
export function generateRandomParkingData(zones: string[]): ParkingData[] {
  return zones.map(zone => {
    const total = Math.floor(Math.random() * 200) + 50; // 50-250 spaces
    const vacant = Math.floor(Math.random() * total);
    const vacantPercentage = Math.round((vacant / total) * 100);
    
    return {
      zone,
      vacant,
      total,
      vacantPercentage,
      lastUpdated: new Date()
    };
  });
} 