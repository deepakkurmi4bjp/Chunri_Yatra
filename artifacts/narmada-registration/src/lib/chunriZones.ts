import type { Allocation, FormValues } from './registrationsApi';

export type ZoneId = 'zone1' | 'zone2' | 'zone3' | 'zone4';

export type ChunriZone = {
  id: ZoneId;
  zoneNumber: 1 | 2 | 3 | 4;
  name: string;
  shortName: string;
  targetCategory: string;
  meterRange: string;
  startMeter: number;
  endMeter: number;
  startSlot: number;
  endSlot: number;
  totalCapacity: number;
  badgeIcon: string;
  themeColor: string;
  bgRgba: string;
  borderRgba: string;
  description: string;
};

export const CHUNRI_ZONES: ChunriZone[] = [
  {
    id: 'zone1',
    zoneNumber: 1,
    name: 'जोन १: मातृशक्ति एवं कन्या खंड (0 - 50M)',
    shortName: 'जोन १: महिलाएं/कन्याएं',
    targetCategory: 'महिलाएं एवं कन्याएं (Females/Girls)',
    meterRange: '0 से 50 मीटर (आरंभिक छोर)',
    startMeter: 0,
    endMeter: 50,
    startSlot: 1,
    endSlot: 100,
    totalCapacity: 100,
    badgeIcon: '🌸',
    themeColor: '#ec4899',
    bgRgba: 'rgba(236, 72, 153, 0.18)',
    borderRgba: 'rgba(236, 72, 153, 0.5)',
    description: 'पहले 50 मीटर - समस्त माताएं, बहनें एवं कन्याएं (पवित्र आरंभ छोर)',
  },
  {
    id: 'zone2',
    zoneNumber: 2,
    name: 'जोन २: समर्पित स्वयंसेवक/स्वयंसेविका खंड (50 - 100M)',
    shortName: 'जोन २: स्वयंसेवक/स्वयंसेविकाएं',
    targetCategory: 'समर्पित स्वयंसेवक एवं व्यवस्थापक दल',
    meterRange: '50 से 100 मीटर (मध्य सुरक्षा खंड)',
    startMeter: 50,
    endMeter: 100,
    startSlot: 101,
    endSlot: 200,
    totalCapacity: 100,
    badgeIcon: '🛡️',
    themeColor: '#f59e0b',
    bgRgba: 'rgba(245, 158, 11, 0.18)',
    borderRgba: 'rgba(245, 158, 11, 0.5)',
    description: 'दूसरे 50 मीटर - यात्रा अनुशासन, सुरक्षा, जल सेवा एवं प्रबंधन दल',
  },
  {
    id: 'zone3',
    zoneNumber: 3,
    name: 'जोन ३: प्रबुद्ध एवं वरिष्ठ नागरिक (100 - 205M)',
    shortName: 'जोन ३: 35+ वर्ष के पुरुष',
    targetCategory: '35 वर्ष से अधिक उम्र के पुरुष (Men > 35 yrs)',
    meterRange: '100 से 205 मीटर (मध्य-उत्तर खंड)',
    startMeter: 100,
    endMeter: 205,
    startSlot: 201,
    endSlot: 316,
    totalCapacity: 116,
    badgeIcon: '🚩',
    themeColor: '#3b82f6',
    bgRgba: 'rgba(59, 130, 246, 0.18)',
    borderRgba: 'rgba(59, 130, 246, 0.5)',
    description: '35 वर्ष से अधिक आयु के समस्त श्रद्धालु पुरुष एवं वरिष्ठ नागरिक',
  },
  {
    id: 'zone4',
    zoneNumber: 4,
    name: 'जोन ४: युवा शक्ति खंड (205 - 255M अंतिम छोर)',
    shortName: 'जोन ४: युवा लड़के/पुरुष (<=35)',
    targetCategory: '35 वर्ष से कम के लड़के/युवा पुरुष (Men <= 35 yrs)',
    meterRange: '205 से 255 मीटर (संगम अंतिम छोर)',
    startMeter: 205,
    endMeter: 255,
    startSlot: 317,
    endSlot: 417,
    totalCapacity: 101,
    badgeIcon: '⚡',
    themeColor: '#10b981',
    bgRgba: 'rgba(16, 185, 129, 0.18)',
    borderRgba: 'rgba(16, 185, 129, 0.5)',
    description: 'चुनरी के अंतिम 50 मीटर - 35 वर्ष से कम के युवा लड़के व पुरुष (गति एवं संतुलन रक्षक)',
  },
];

/**
 * Determine natural zone based strictly on age and gender (Zones 1, 3, 4)
 */
export function getNaturalZoneByDemographics(
  gender: '' | 'male' | 'female',
  age: string | number
): ChunriZone {
  const numAge = typeof age === 'number' ? age : parseInt(String(age), 10);
  if (gender === 'female') {
    return CHUNRI_ZONES[0]; // Zone 1: महिलाएं / कन्याएं (0-50m)
  }
  if (gender === 'male' && !isNaN(numAge) && numAge > 35) {
    return CHUNRI_ZONES[2]; // Zone 3: 35+ वर्ष के पुरुष (100-205m)
  }
  if (gender === 'male') {
    return CHUNRI_ZONES[3]; // Zone 4: 35 वर्ष से कम के लड़के/युवा (205-255m)
  }
  return CHUNRI_ZONES[0];
}

/**
 * Automatically determine the correct Zone based on applicant's age, gender and volunteer choice
 */
export function determineZoneForDevotee(params: {
  gender: '' | 'male' | 'female';
  age: string | number;
  isVolunteer?: boolean;
  volunteerStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}): ChunriZone {
  const { gender, age, isVolunteer, volunteerStatus } = params;

  // If volunteer is explicitly approved by Admin -> Zone 2 (50 - 100M)
  if (volunteerStatus === 'approved') {
    return CHUNRI_ZONES[1];
  }

  // If volunteer was rejected by Admin -> automatically shift to Age/Gender Zone
  if (volunteerStatus === 'rejected') {
    return getNaturalZoneByDemographics(gender, age);
  }

  // If user requested volunteer (and not rejected) -> Zone 2
  if (isVolunteer) {
    return CHUNRI_ZONES[1];
  }

  // Standard demographic allocation
  return getNaturalZoneByDemographics(gender, age);
}

/**
 * Special pending allocation object for volunteers waiting for Admin approval
 */
export function createPendingVolunteerAllocation(): Allocation {
  const zone2 = CHUNRI_ZONES[1];
  return {
    slotNumber: 0,
    side: 'left',
    distanceFeet: 0,
    distanceMeters: 0,
    zoneId: zone2.id,
    zoneName: zone2.shortName,
    zoneCategory: zone2.targetCategory,
    isPendingApproval: true,
  };
}

/**
 * Get Zone definition for a given slotNumber
 */
export function getZoneBySlotNumber(slotNumber: number): ChunriZone {
  const found = CHUNRI_ZONES.find((z) => slotNumber >= z.startSlot && slotNumber <= z.endSlot);
  return found || CHUNRI_ZONES[0];
}

/**
 * Calculate full Allocation object for a slotNumber including zone details
 */
export function getAllocationForSlot(slotNumber: number): Allocation {
  const distanceFeet = Math.ceil(slotNumber / 2) * 2;
  const distanceMeters = Number((distanceFeet * 0.3048).toFixed(2));
  const side = slotNumber % 2 === 1 ? 'left' : 'right';
  const zone = getZoneBySlotNumber(slotNumber);

  return {
    slotNumber,
    side,
    distanceFeet,
    distanceMeters,
    zoneId: zone.id,
    zoneName: zone.shortName,
    zoneCategory: zone.targetCategory,
  };
}

/**
 * Automatically find the next available free slot in the designated Zone
 */
export function findNextAvailableSlotInZone(
  zone: ChunriZone,
  occupiedSlots: Set<number>
): number {
  for (let s = zone.startSlot; s <= zone.endSlot; s++) {
    if (!occupiedSlots.has(s)) {
      return s;
    }
  }

  // If this zone is full, search any other free slot in the 417 capacity
  for (let s = 1; s <= 417; s++) {
    if (!occupiedSlots.has(s)) {
      return s;
    }
  }

  return zone.endSlot;
}
