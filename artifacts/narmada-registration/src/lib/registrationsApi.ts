// Client API service for Centralized Multi-device Registration Database
export type Allocation = {
  slotNumber: number;
  side: 'left' | 'right';
  distanceFeet: number;
  distanceMeters: number;
};

export type Companion = {
  id: number;
  name: string;
  age: string;
  gender: '' | 'male' | 'female';
  relation: string;
};

export type FormValues = {
  name: string;
  fatherName: string;
  motherName: string;
  age: string;
  gender: '' | 'male' | 'female';
  mobile: string;
  whatsapp: string;
  village: string;
  block: string;
  district: string;
  allergy: string;
};

export type RegistrationRecord = {
  id: string;
  createdAt: string;
  status: 'new' | 'checked';
  values: FormValues;
  companions: Companion[];
  allocation: Allocation;
};

export async function fetchServerRegistrations(): Promise<RegistrationRecord[]> {
  try {
    const res = await fetch('/api/registrations', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.records) ? data.records : [];
  } catch (err) {
    console.warn('Failed to fetch registrations from server, falling back to local storage', err);
    return [];
  }
}

export async function createServerRegistration(
  record: Omit<RegistrationRecord, 'allocation'> & { allocation?: Allocation }
): Promise<RegistrationRecord> {
  const res = await fetch('/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.record as RegistrationRecord;
}

export async function updateServerRegistration(
  id: string,
  updates: Partial<RegistrationRecord>
): Promise<RegistrationRecord> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.record as RegistrationRecord;
}

export async function deleteServerRegistration(id: string): Promise<boolean> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server error ${res.status}`);
  }

  return true;
}

export async function syncLocalRecordsToServer(
  localRecords: RegistrationRecord[]
): Promise<RegistrationRecord[]> {
  if (!localRecords || localRecords.length === 0) {
    return fetchServerRegistrations();
  }

  try {
    const res = await fetch('/api/registrations/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: localRecords }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.records) ? data.records : [];
  } catch (err) {
    console.warn('Sync failed, using server records', err);
    return fetchServerRegistrations();
  }
}
