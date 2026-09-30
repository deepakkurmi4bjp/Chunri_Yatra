// Client API service for Centralized Multi-device Registration Database
export type VolunteerStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type Allocation = {
  slotNumber: number;
  side: 'left' | 'right';
  distanceFeet: number;
  distanceMeters: number;
  zoneId?: string;
  zoneName?: string;
  zoneCategory?: string;
  isPendingApproval?: boolean;
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
  isVolunteer?: boolean;
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
  volunteerStatus?: VolunteerStatus;
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
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return [];
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
  try {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server error ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return record as RegistrationRecord;
    }

    const data = await res.json();
    return (data.record as RegistrationRecord) || (record as RegistrationRecord);
  } catch (err) {
    console.warn('Server registration save error, keeping local', err);
    return record as RegistrationRecord;
  }
}

export async function updateServerRegistration(
  id: string,
  updates: Partial<RegistrationRecord>
): Promise<RegistrationRecord | null> {
  try {
    const res = await fetch(`/api/registrations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;

    const data = await res.json();
    return (data.record as RegistrationRecord) || null;
  } catch (err) {
    console.warn('Server update error, keeping local', err);
    return null;
  }
}

export async function deleteServerRegistration(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/registrations/${id}`, {
      method: 'DELETE',
    });

    return res.ok;
  } catch (err) {
    console.warn('Server delete error, keeping local', err);
    return true;
  }
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

    if (!res.ok) return localRecords;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return localRecords;

    const data = await res.json();
    return Array.isArray(data.records) ? data.records : localRecords;
  } catch (err) {
    console.warn('Sync failed, using local records', err);
    return localRecords;
  }
}
