import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Accessibility,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  Home,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Pencil,
  PersonStanding,
  Phone,
  Plus,
  Ruler,
  Search,
  ShieldCheck,
  Send,
  Trash2,
  UsersRound,
  UserRound,
  UserRoundPlus,
  X,
} from 'lucide-react';
import './index.css';

type Gender = '' | 'male' | 'female';
type View = 'form' | 'admin-login' | 'admin';
type RecordStatus = 'new' | 'checked';
type Companion = {
  id: number;
  name: string;
  age: string;
  gender: Gender;
  relation: string;
};
type FormValues = {
  name: string;
  fatherName: string;
  motherName: string;
  age: string;
  gender: Gender;
  mobile: string;
  whatsapp: string;
  village: string;
  block: string;
  district: string;
  allergy: string;
};
type Errors = Partial<Record<keyof FormValues, string>>;
type Allocation = {
  slotNumber: number;
  side: 'left' | 'right';
  distanceFeet: number;
  distanceMeters: number;
};
type RegistrationRecord = {
  id: string;
  createdAt: string;
  status: RecordStatus;
  values: FormValues;
  companions: Companion[];
  allocation: Allocation;
};

const STORAGE_KEY = 'narmada-registration-records';
const ADMIN_EMAIL = 'Deepak53802@gmail.com';
const ADMIN_PASSWORD = 'Aditya@123';
const CHUNRI_LENGTH_METERS = 255;
const CHUNRI_LENGTH_FEET = CHUNRI_LENGTH_METERS * 3.28084;
const CHUNRI_CAPACITY = 417;
const initialForm: FormValues = {
  name: '',
  fatherName: '',
  motherName: '',
  age: '',
  gender: '',
  mobile: '',
  whatsapp: '',
  village: '',
  block: '',
  district: '',
  allergy: '',
};
const relations = ['भाई - भाई', 'माता - पिता', 'पति - पत्नी', 'पुत्र - पुत्री', 'अन्य'];

function getStoredRecords(): RegistrationRecord[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as RegistrationRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((record, index) => ({
      ...record,
      allocation: record.allocation ?? getAllocation(index + 1),
    }));
  } catch {
    return [];
  }
}

function getAllocation(slotNumber: number): Allocation {
  const distanceFeet = Math.ceil(slotNumber / 2) * 2;
  const side = slotNumber % 2 === 1 ? 'left' : 'right';
  return {
    slotNumber,
    side,
    distanceFeet,
    distanceMeters: Number((distanceFeet * 0.3048).toFixed(2)),
  };
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function Field({
  label,
  hindi,
  required,
  icon,
  error,
  children,
  full = false,
}: {
  label: string;
  hindi: string;
  required?: boolean;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      <label className="field-label">
        <span>
          {label} <span>({hindi})</span>
          {required && <span className="required"> *</span>}
        </span>
      </label>
      <div className="control-wrap">
        {icon}
        {children}
      </div>
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

function AdminLogin({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      setError('');
      onSuccess();
      return;
    }
    setError('ईमेल या पासवर्ड सही नहीं है');
  };

  return (
    <main className="admin-login-shell">
      <div className="admin-login-stage">
        <button className="login-back" type="button" onClick={onBack}>
          <X size={15} /> Public Form
        </button>
        <form className="admin-login-form" onSubmit={handleLogin} noValidate>
          <label className="login-control">
            <UserRound size={21} />
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="उपयोगकर्ता नाम / ईमेल"
              aria-label="Admin email"
              required
            />
          </label>
          <label className="login-control">
            <LockKeyhole size={21} />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="पासवर्ड"
              aria-label="Admin password"
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit">
            लॉगिन करें <ChevronRight size={28} />
          </button>
        </form>
      </div>
    </main>
  );
}

function AdminPanel({
  records,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
  onLogout,
}: {
  records: RegistrationRecord[];
  onBack: () => void;
  onEdit: (record: RegistrationRecord) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onLogout: () => void;
}) {
  const [query, setQuery] = useState('');
  const filteredRecords = records.filter((record) => {
    const searchText = `${record.values.name} ${record.values.mobile} ${record.values.district} ${record.values.village}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
  const checkedCount = records.filter((record) => record.status === 'checked').length;

  return (
    <main className="app-shell admin-shell">
      <div className="app-frame">
        <div className="app-toolbar">
          <p className="top-mark">|| नर्मदा हर ||</p>
          <button className="admin-button" type="button" onClick={onLogout}>
            <X size={15} /> Logout
          </button>
        </div>
        <section className="admin-card">
          <header className="admin-hero">
            <div>
              <p className="sacred-line">|| नर्मदे हर ||</p>
              <h1>श्री माँ नर्मदा</h1>
              <p>यात्रा पंजीयन — Admin Panel</p>
            </div>
            <ClipboardList size={43} strokeWidth={1.4} />
          </header>
          <div className="admin-body">
            <div className="admin-heading-row">
              <div>
                <h2>
                  <UsersRound size={20} /> Registration Records
                </h2>
                <p>सभी पंजीकृत यात्रियों का विवरण यहाँ देखें और प्रबंधित करें</p>
              </div>
              <button className="public-form-button" type="button" onClick={onBack}>
                <Plus size={16} /> New Registration
              </button>
            </div>
            <div className="admin-stats">
              <div className="admin-stat">
                <span>Total Registrations</span>
                <strong>{records.length}</strong>
              </div>
              <div className="admin-stat">
                <span>Checked</span>
                <strong>{checkedCount}</strong>
              </div>
              <div className="admin-stat">
                <span>Pending Review</span>
                <strong>{records.length - checkedCount}</strong>
              </div>
              <div className="admin-stat chunri-stat">
                <span>255m Chunri Slots</span>
                <strong>{Math.max(0, CHUNRI_CAPACITY - records.length)}</strong>
              </div>
            </div>
            <label className="admin-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="नाम, मोबाइल, गाँव या जिला खोजें"
                aria-label="Search registrations"
              />
            </label>
            {filteredRecords.length === 0 ? (
              <div className="admin-empty">
                <ClipboardList size={38} />
                <h3>{records.length ? 'No matching registrations' : 'अभी कोई पंजीयन नहीं है'}</h3>
                <p>
                  {records.length
                    ? 'अपनी खोज बदलकर फिर से प्रयास करें।'
                    : 'Public registration form से पहला पंजीयन भरें।'}
                </p>
                {!records.length && (
                  <button className="submit-button compact-button" type="button" onClick={onBack}>
                    <Plus size={16} /> Open Registration Form
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-records" role="list">
                {filteredRecords.map((record, index) => (
                  <article className="admin-record" key={record.id} role="listitem">
                    <div className="record-number">{String(index + 1).padStart(2, '0')}</div>
                    <div className="record-main">
                      <div className="record-name-row">
                        <h3>{record.values.name}</h3>
                        <span className={`status-badge ${record.status}`}>
                          {record.status === 'checked' ? <CheckCircle2 size={13} /> : <span className="status-dot" />}
                          {record.status === 'checked' ? 'Checked' : 'New'}
                        </span>
                      </div>
                      <p>
                        {record.values.mobile} <span>•</span> {record.values.village}, {record.values.district}
                      </p>
                      <small>
                        {record.values.gender === 'female' ? 'Female' : 'Male'} <span>•</span> Age {record.values.age}
                        <span>•</span> {record.companions.length} Companion{record.companions.length === 1 ? '' : 's'}
                      </small>
                      <small className="record-allocation">
                        <Ruler size={11} /> Slot #{record.allocation.slotNumber} <span>•</span>
                        {record.allocation.side === 'left' ? 'Left end' : 'Right end'} {record.allocation.distanceFeet} ft
                      </small>
                    </div>
                    <div className="record-date">
                      {new Date(record.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="record-actions">
                      <button
                        className={`record-action check-action ${record.status === 'checked' ? 'active' : ''}`}
                        type="button"
                        onClick={() => onToggleStatus(record.id)}
                        title={record.status === 'checked' ? 'Mark as new' : 'Mark as checked'}
                      >
                        <Check size={15} />
                      </button>
                      <button className="record-action edit-action" type="button" onClick={() => onEdit(record)} title="Edit registration">
                        <Pencil size={15} />
                      </button>
                      <button className="record-action delete-action" type="button" onClick={() => onDelete(record.id)} title="Delete registration">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ChunriAllocationCard({
  allocation,
  isUpdate,
  onNewRegistration,
  onAdmin,
}: {
  allocation: Allocation;
  isUpdate: boolean;
  onNewRegistration: () => void;
  onAdmin: () => void;
}) {
  return (
    <section className="registration-card chunri-success-card" data-testid="status-registration-success">
      <div className="chunri-emblem">
        <Ruler size={30} />
      </div>
      <p className="chunri-kicker">माँ नर्मदा की सेवा में</p>
      <h1>255 मीटर की चुनरी</h1>
      <p className="chunri-success-copy">
        {isUpdate ? 'आपका पंजीयन विवरण अपडेट हो गया है।' : 'आपका पंजीयन सफलतापूर्वक हो गया है।'}
        <br />आपके लिए चुनरी पकड़ने की जगह स्वतः निर्धारित कर दी गई है।
      </p>
      <div className="chunri-ribbon">
        <span className="ribbon-end">आरंभ</span>
        <div className="ribbon-track">
          <span className={`allocation-marker ${allocation.side}`} />
          <span className="ribbon-label">255 METERS</span>
        </div>
        <span className="ribbon-end">अंत</span>
      </div>
      <div className="allocation-card">
        <span className="allocation-caption">आपका चुनरी स्थान</span>
        <strong>स्थान #{allocation.slotNumber}</strong>
        <p>
          <span>{allocation.side === 'left' ? 'बाएँ सिरे' : 'दाएँ सिरे'} से</span>
          <b>{allocation.distanceFeet} फीट</b>
          <span>({allocation.distanceMeters} मीटर)</span>
        </p>
      </div>
      <p className="spacing-note">
        <ShieldCheck size={15} /> दोनों सिरों से हर 2 फीट पर एक व्यक्ति का क्रम
      </p>
      <div className="thank-actions">
        <button className="back-button" type="button" onClick={onNewRegistration}>
          नया पंजीयन करें
        </button>
        <button className="outline-button" type="button" onClick={onAdmin}>
          <ClipboardList size={16} /> Admin Panel
        </button>
      </div>
    </section>
  );
}

function App() {
  const [values, setValues] = useState<FormValues>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<View>(() => (
    new URLSearchParams(window.location.search).get('admin') === '1'
      ? 'admin-login'
      : 'form'
  ));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [records, setRecords] = useState<RegistrationRecord[]>(getStoredRecords);
  const [lastAllocation, setLastAllocation] = useState<Allocation | null>(null);
  const [capacityError, setCapacityError] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const update = (key: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const required: Array<keyof FormValues> = [
      'name',
      'fatherName',
      'motherName',
      'age',
      'gender',
      'mobile',
      'whatsapp',
      'village',
      'block',
      'district',
    ];
    const next: Errors = {};
    required.forEach((key) => {
      if (!values[key].trim()) next[key] = 'यह जानकारी आवश्यक है';
    });
    if (values.mobile && !/^[0-9]{10}$/.test(values.mobile)) next.mobile = '10 अंकों का मोबाइल नंबर लिखें';
    if (values.whatsapp && !/^[0-9]{10}$/.test(values.whatsapp)) next.whatsapp = '10 अंकों का मोबाइल नंबर लिखें';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    if (editingId) {
      const existingRecord = records.find((record) => record.id === editingId);
      if (existingRecord) setLastAllocation(existingRecord.allocation);
      setRecords((current) =>
        current.map((record) =>
          record.id === editingId
            ? { ...record, values, companions }
            : record,
        ),
      );
    } else {
      const nextSlot = records.reduce(
        (max, record) => Math.max(max, record.allocation.slotNumber),
        0,
      ) + 1;
      if (nextSlot > CHUNRI_CAPACITY) {
        setCapacityError('255 मीटर की चुनरी के सभी स्थान भर चुके हैं।');
        return;
      }
      const allocation = getAllocation(nextSlot);
      setLastAllocation(allocation);
      setCapacityError('');
      setRecords((current) => [
        {
          id: makeId(),
          createdAt: new Date().toISOString(),
          status: 'new',
          values,
          companions,
          allocation,
        },
        ...current,
      ]);
    }
    setSubmitted(true);
  };

  const handleMobile = (value: string) => {
    const mobile = value.replace(/\D/g, '').slice(0, 10);
    setValues((current) => ({ ...current, mobile, ...(sameWhatsapp ? { whatsapp: mobile } : {}) }));
    setErrors((current) => ({ ...current, mobile: undefined, ...(sameWhatsapp ? { whatsapp: undefined } : {}) }));
  };

  const addCompanion = () =>
    setCompanions((current) => [
      ...current,
      { id: Date.now(), name: '', age: '', gender: '', relation: '' },
    ]);

  const updateCompanion = (id: number, key: keyof Companion, value: string) => {
    setCompanions((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const resetForm = () => {
    setValues(initialForm);
    setCompanions([]);
    setErrors({});
    setSubmitted(false);
    setSameWhatsapp(false);
    setEditingId(null);
    setLastAllocation(null);
    setCapacityError('');
  };

  const editRecord = (record: RegistrationRecord) => {
    setValues(record.values);
    setCompanions(record.companions);
    setErrors({});
    setSameWhatsapp(record.values.mobile === record.values.whatsapp);
    setEditingId(record.id);
    setLastAllocation(record.allocation);
    setCapacityError('');
    setSubmitted(false);
    setView('form');
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('क्या आप इस पंजीयन को हटाना चाहते हैं?')) {
      setRecords((current) => current.filter((record) => record.id !== id));
    }
  };

  const toggleRecordStatus = (id: string) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, status: record.status === 'checked' ? 'new' : 'checked' }
          : record,
      ),
    );
  };

  if (view === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={() => setView('admin')}
        onBack={() => setView('form')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminPanel
        records={records}
        onBack={() => {
          resetForm();
          setView('form');
        }}
        onEdit={editRecord}
        onDelete={deleteRecord}
        onToggleStatus={toggleRecordStatus}
        onLogout={() => {
          resetForm();
          setView('form');
        }}
      />
    );
  }

  if (submitted) {
    return (
      <main className="app-shell">
        <div className="app-frame">
          <div className="app-toolbar">
            <p className="top-mark">|| नर्मदा हर ||</p>
            <button className="admin-button" type="button" onClick={() => setView('admin-login')}>
              <ClipboardList size={15} /> Admin Panel
            </button>
          </div>
          {lastAllocation && (
            <ChunriAllocationCard
              allocation={lastAllocation}
              isUpdate={Boolean(editingId)}
              onNewRegistration={resetForm}
              onAdmin={() => {
                setSubmitted(false);
                setView('admin-login');
              }}
            />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-frame">
        <div className="app-toolbar">
          <p className="top-mark">|| नर्मदा हर ||</p>
          <button className="admin-button" type="button" onClick={() => setView('admin-login')}>
            <ClipboardList size={15} /> Admin Panel
          </button>
        </div>
        {editingId && (
          <div className="editing-notice">
            <Pencil size={14} /> Editing registration details
            <button type="button" onClick={resetForm} aria-label="Cancel editing">
              <X size={15} />
            </button>
          </div>
        )}
        <section className="registration-card">
          <header className="hero-banner">
            <div className="hero-copy">
              <div className="sacred-line">|| नर्मदे हर ||</div>
              <h1 className="hero-title">श्री माँ नर्मदा</h1>
              <h2 className="hero-subtitle">भक्त परिवार</h2>
              <div className="hero-rule" />
              <div className="hero-note">सेवा • श्रद्धा • संस्कृति • संगठित समाज</div>
            </div>
          </header>
          <form className="form-wrap" onSubmit={handleSubmit} noValidate>
            <h2 className="section-heading">
              <FileText size={22} /> यात्रा पंजीयन फॉर्म
            </h2>
            <p className="section-subtitle">श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा में सहभागी बनने हेतु अपना विवरण भरें</p>
            <section className="fields-panel" aria-label="Registration details">
              <div className="field-grid">
                <Field label="Name" hindi="नाम" required icon={<UserRound size={17} />} error={errors.name}>
                  <input className="control" value={values.name} onChange={(e) => update('name', e.target.value)} placeholder="अपना पूरा नाम लिखें" data-testid="input-name" />
                </Field>
                <Field label="Father's Name" hindi="पिता का नाम" required icon={<UsersRound size={17} />} error={errors.fatherName}>
                  <input className="control" value={values.fatherName} onChange={(e) => update('fatherName', e.target.value)} placeholder="पिता का नाम लिखें" data-testid="input-father-name" />
                </Field>
                <Field label="Mother's Name" hindi="माता का नाम" required icon={<UserRoundPlus size={17} />} error={errors.motherName}>
                  <input className="control" value={values.motherName} onChange={(e) => update('motherName', e.target.value)} placeholder="माता का नाम लिखें" data-testid="input-mother-name" />
                </Field>
                <Field label="Age" hindi="आयु" required icon={<CalendarDays size={17} />} error={errors.age}>
                  <input className="control" type="number" min="1" max="120" value={values.age} onChange={(e) => update('age', e.target.value)} placeholder="आयु (वर्ष में)" data-testid="input-age" />
                </Field>
                <Field label="Gender" hindi="लिंग" required icon={<Accessibility size={17} />} error={errors.gender} full>
                  <div className="gender-row">
                    <label className={`gender-option${values.gender === 'male' ? ' selected male' : ''}`}>
                      <input type="radio" name="gender" checked={values.gender === 'male'} onChange={() => update('gender', 'male')} data-testid="radio-gender-male" />
                      <PersonStanding size={18} /> Male
                    </label>
                    <label className={`gender-option${values.gender === 'female' ? ' selected female' : ''}`}>
                      <input type="radio" name="gender" checked={values.gender === 'female'} onChange={() => update('gender', 'female')} data-testid="radio-gender-female" />
                      <PersonStanding size={18} /> Female
                    </label>
                  </div>
                </Field>
                <Field label="Mobile Number" hindi="मोबाइल नंबर" required icon={<Phone size={17} />} error={errors.mobile}>
                  <div className="mobile-with-check">
                    <div className="control-wrap">
                      <Phone size={17} />
                      <input className="control" inputMode="numeric" value={values.mobile} onChange={(e) => handleMobile(e.target.value)} placeholder="मोबाइल नंबर लिखें" data-testid="input-mobile" />
                    </div>
                    <label className={`whatsapp-same${sameWhatsapp ? ' checked' : ''}`}>
                      <input type="checkbox" checked={sameWhatsapp} onChange={(e) => { setSameWhatsapp(e.target.checked); if (e.target.checked) update('whatsapp', values.mobile); }} data-testid="checkbox-same-whatsapp" />
                      <span>WhatsApp<br />same?</span>
                    </label>
                  </div>
                </Field>
                <Field label="WhatsApp Number" hindi="व्हाट्सऐप नंबर" required icon={<MessageCircle size={17} />} error={errors.whatsapp}>
                  <input className="control" inputMode="numeric" value={values.whatsapp} onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="व्हाट्सऐप नंबर लिखें" disabled={sameWhatsapp} data-testid="input-whatsapp" />
                </Field>
                <Field label="Village" hindi="गाँव" required icon={<Home size={17} />} error={errors.village}>
                  <input className="control" value={values.village} onChange={(e) => update('village', e.target.value)} placeholder="गाँव का नाम लिखें" data-testid="input-village" />
                </Field>
                <Field label="Block" hindi="ब्लॉक" required icon={<Home size={17} />} error={errors.block}>
                  <input className="control" value={values.block} onChange={(e) => update('block', e.target.value)} placeholder="ब्लॉक का नाम लिखें" data-testid="input-block" />
                </Field>
                <Field label="District" hindi="जिला" required icon={<MapPin size={17} />} error={errors.district}>
                  <input className="control" value={values.district} onChange={(e) => update('district', e.target.value)} placeholder="जिले का नाम लिखें" data-testid="input-district" />
                </Field>
                <Field label="Any Disease / Allergy" hindi="कोई बीमारी / एलर्जी" icon={<HeartPulse size={17} />}>
                  <input className="control" value={values.allergy} onChange={(e) => update('allergy', e.target.value)} placeholder="यदि कोई बीमारी / एलर्जी हो तो लिखें" data-testid="input-allergy" />
                </Field>
              </div>
            </section>
            <section className="companion-panel" aria-label="Companion details">
              <h2 className="section-heading companion-heading"><UsersRound size={22} /> Are there any other companions coming with you?</h2>
              <p className="section-subtitle companion-subtitle">क्या आपके साथ और भी कोई साथी आ रहे हैं?</p>
              {companions.map((companion, index) => (
                <div className="companion-row" key={companion.id}>
                  <Field label="Name" hindi="नाम">
                    <input className="control" value={companion.name} onChange={(e) => updateCompanion(companion.id, 'name', e.target.value)} placeholder="नाम" data-testid={`input-companion-name-${index}`} />
                  </Field>
                  <Field label="Age" hindi="आयु">
                    <input className="control" type="number" value={companion.age} onChange={(e) => updateCompanion(companion.id, 'age', e.target.value)} placeholder="आयु" data-testid={`input-companion-age-${index}`} />
                  </Field>
                  <Field label="Gender" hindi="लिंग">
                    <select className="select-control" value={companion.gender} onChange={(e) => updateCompanion(companion.id, 'gender', e.target.value as Gender)} data-testid={`select-companion-gender-${index}`}>
                      <option value="">Select</option><option value="male">Male</option><option value="female">Female</option>
                    </select>
                  </Field>
                  <Field label="Relation" hindi="संबंध">
                    <select className="select-control" value={companion.relation} onChange={(e) => updateCompanion(companion.id, 'relation', e.target.value)} data-testid={`select-companion-relation-${index}`}>
                      <option value="">Select</option>{relations.map((relation) => <option key={relation} value={relation}>{relation}</option>)}
                    </select>
                  </Field>
                  <button className="remove-companion" type="button" onClick={() => setCompanions((current) => current.filter((item) => item.id !== companion.id))} aria-label={`Remove companion ${index + 1}`} data-testid={`button-remove-companion-${index}`}><Trash2 size={15} /></button>
                </div>
              ))}
              <button className="add-companion" type="button" onClick={addCompanion} data-testid="button-add-companion"><Plus size={15} /> Add Another Companion</button>
            </section>
            {capacityError && <p className="capacity-error"><Ruler size={14} /> {capacityError}</p>}
            <button className="submit-button" type="submit" data-testid="button-submit-registration">
              {editingId ? <Pencil size={17} /> : <Send size={17} />} {editingId ? 'Update Registration' : 'Submit Registration'}
            </button>
            <p className="form-footnote"><strong>माँ नर्मदा का आशीर्वाद, सदैव आपके साथ</strong></p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default App;