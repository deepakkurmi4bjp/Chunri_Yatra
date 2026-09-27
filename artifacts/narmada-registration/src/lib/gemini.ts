// Gemini Pro client service for Shri Maa Narmada Chunri Yatra Portal
export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
};

export type ExtractedFormValues = {
  name?: string;
  fatherName?: string;
  motherName?: string;
  age?: string;
  gender?: 'male' | 'female' | '';
  mobile?: string;
  whatsapp?: string;
  village?: string;
  block?: string;
  district?: string;
  allergy?: string;
};

const DEFAULT_MODEL = 'gemini-3.8-flash';

// Helper to get active API key if user configured custom one in localStorage
export function getCustomApiKey(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('narmada-custom-gemini-key') || '';
}

export function setCustomApiKey(key: string) {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    window.localStorage.removeItem('narmada-custom-gemini-key');
  } else {
    window.localStorage.setItem('narmada-custom-gemini-key', key.trim());
  }
}

// 1. AI Smart Auto-Fill from Voice or Free Text
export async function autoFillFormWithAI(freeText: string): Promise<ExtractedFormValues> {
  const customKey = getCustomApiKey();

  const response = await fetch('/api/gemini/autofill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-key': customKey } : {}),
    },
    body: JSON.stringify({ text: freeText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI auto-fill failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data as ExtractedFormValues;
}

// 2. Personalized Divine Sankalp & Blessings Generator
export async function generateDivineSankalp(
  devotee: {
    name: string;
    fatherName: string;
    motherName: string;
    village: string;
    district: string;
    age: string;
  },
  slot: {
    slotNumber: number;
    side: 'left' | 'right';
    distanceFeet: number;
    distanceMeters: number;
  },
): Promise<string> {
  const customKey = getCustomApiKey();

  const response = await fetch('/api/gemini/sankalp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-key': customKey } : {}),
    },
    body: JSON.stringify({ devotee, slot }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Sankalp generation failed`);
  }

  const result = await response.json();
  return result.sankalp as string;
}

// 3. Narmada AI Sahayak (Spiritual Guide & Yatra Assistant)
export async function askNarmadaSahayak(
  prompt: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = [],
): Promise<string> {
  const customKey = getCustomApiKey();

  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-key': customKey } : {}),
    },
    body: JSON.stringify({ prompt, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI Chat failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.reply as string;
}

// 4. Admin Intelligence Report
export async function generateAdminAnalyticsReport(recordsSummary: {
  total: number;
  checkedCount: number;
  districts: Record<string, number>;
  genderCount: { male: number; female: number };
  averageAge: number;
  slotsUsed: number;
}): Promise<string> {
  const customKey = getCustomApiKey();

  const response = await fetch('/api/gemini/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-key': customKey } : {}),
    },
    body: JSON.stringify({ summary: recordsSummary }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Analytics generation failed`);
  }

  const result = await response.json();
  return result.report as string;
}
