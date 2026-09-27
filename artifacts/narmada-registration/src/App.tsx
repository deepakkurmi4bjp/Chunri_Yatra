import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Accessibility,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  Download,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  Home,
  Key,
  LockKeyhole,
  MapPin,
  Maximize2,
  MessageCircle,
  Pencil,
  PersonStanding,
  Phone,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Ruler,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UserRoundPlus,
  UsersRound,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { holyAudio } from './lib/sound';
import QRCode from 'qrcode';
import {
  fetchServerRegistrations,
  createServerRegistration,
  updateServerRegistration,
  deleteServerRegistration,
  syncLocalRecordsToServer,
} from './lib/registrationsApi';
import {
  AdminReportModal,
  AiAutoFillModal,
  GeminiSettingsModal,
  NarmadaAiChatModal,
  PersonalizedDivineSankalpBox,
} from './components/AiAssistant';
import { QrPassModal } from './components/QrPassModal';
import { ChunriSeatBookingMap } from './components/ChunriSeatBookingMap';
import {
  CHUNRI_ZONES,
  determineZoneForDevotee,
  getAllocationForSlot,
  findNextAvailableSlotInZone,
  getZoneBySlotNumber,
  getNaturalZoneByDemographics,
  createPendingVolunteerAllocation,
  type ChunriZone,
} from './lib/chunriZones';
import type { ExtractedFormValues } from './lib/gemini';
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
const CHUNRI_LENGTH_FEET = Math.round(CHUNRI_LENGTH_METERS * 3.28084);
const CHUNRI_CAPACITY = 417;

const initialForm: FormValues = {
  name: '',
  fatherName: '',
  motherName: '',
  age: '',
  gender: '',
  isVolunteer: false,
  mobile: '',
  whatsapp: '',
  village: '',
  block: '',
  district: '',
  allergy: '',
};

const relations = ['भाई - भाई', 'माता - पिता', 'पति - पत्नी', 'पुत्र - पुत्री', 'अन्य मित्र / परिजन'];

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
  return getAllocationForSlot(slotNumber);
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Cinematic celestial floating particles & river aura canvas
function CinematicCosmosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.6 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.03;
        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.25);

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        const rad = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 2.5);
        grad.addColorStop(0, `rgba(255, 230, 130, ${currentAlpha})`);
        grad.addColorStop(0.5, `rgba(245, 185, 45, ${currentAlpha * 0.6})`);
        grad.addColorStop(1, 'rgba(245, 185, 45, 0)');

        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, rad * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cinematic-cosmos-canvas" aria-hidden="true" />;
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
        <span className="field-label-text">
          {label} <span className="field-label-hindi">({hindi})</span>
          {required && <span className="required-star"> *</span>}
        </span>
      </label>
      <div className={`control-wrap${error ? ' has-error' : ''}`}>
        {icon && <span className="control-icon">{icon}</span>}
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
    holyAudio.playRipple();
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      setError('');
      holyAudio.playTempleChime();
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit">
            प्रवेश करें
            <ChevronRight />
          </button>
        </form>
      </div>
    </main>
  );
}

function AdminPanel({
  records,
  isSyncing,
  onRefresh,
  onOpenQrPass,
  onOpenSeatMap,
  onApproveVolunteer,
  onRejectVolunteer,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
  onLogout,
}: {
  records: RegistrationRecord[];
  isSyncing?: boolean;
  onRefresh?: () => void;
  onOpenQrPass: (record?: RegistrationRecord) => void;
  onOpenSeatMap?: () => void;
  onApproveVolunteer: (id: string) => void;
  onRejectVolunteer: (id: string) => void;
  onBack: () => void;
  onEdit: (record: RegistrationRecord) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onLogout: () => void;
}) {
  const [query, setQuery] = useState('');
  const [volunteerFilter, setVolunteerFilter] = useState<'all' | 'pending' | 'approved' | 'normal'>('all');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const pendingVolunteersCount = records.filter(
    (r) => r.allocation?.isPendingApproval || r.volunteerStatus === 'pending'
  ).length;

  const approvedVolunteersCount = records.filter(
    (r) => r.volunteerStatus === 'approved'
  ).length;

  const filteredRecords = records.filter((record) => {
    // 1. Filter by volunteer filter tab
    if (volunteerFilter === 'pending') {
      if (!record.allocation?.isPendingApproval && record.volunteerStatus !== 'pending') return false;
    } else if (volunteerFilter === 'approved') {
      if (record.volunteerStatus !== 'approved') return false;
    } else if (volunteerFilter === 'normal') {
      if (record.values.isVolunteer || record.volunteerStatus === 'approved' || record.volunteerStatus === 'pending') return false;
    }

    // 2. Filter by search query
    const searchText = `${record.values.name} ${record.values.mobile} ${record.values.district} ${record.values.village} ${record.allocation?.zoneName || ''}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
  const checkedCount = records.filter((record) => record.status === 'checked').length;

  const exportCSV = () => {
    holyAudio.playRipple();
    const headers = [
      'Slot No',
      'Zone',
      'Volunteer Status',
      'Side',
      'Distance (Feet)',
      'Name',
      'Father Name',
      'Mother Name',
      'Age',
      'Gender',
      'Mobile',
      'WhatsApp',
      'Village',
      'Block',
      'District',
      'Allergy/Disease',
      'Companions Count',
      'Status',
      'Registered At',
    ];

    const rows = records.map((r) => [
      r.allocation?.isPendingApproval ? 'सत्यापन प्रतीक्षारत (Pending Approval)' : r.allocation?.slotNumber,
      `"${r.allocation?.zoneName || ''}"`,
      r.volunteerStatus === 'approved'
        ? 'स्वीकृत स्वयंसेवक (Approved)'
        : r.volunteerStatus === 'rejected'
        ? 'अस्वीकृत (Shifted)'
        : r.volunteerStatus === 'pending' || r.allocation?.isPendingApproval
        ? 'समीक्षाधीन (Pending)'
        : 'सामान्य श्रद्धालु',
      r.allocation?.isPendingApproval ? 'प्रतीक्षारत' : (r.allocation?.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'),
      r.allocation?.isPendingApproval ? 'प्रतीक्षारत' : `${r.allocation?.distanceFeet} ft`,
      `"${r.values.name}"`,
      `"${r.values.fatherName}"`,
      `"${r.values.motherName}"`,
      r.values.age,
      r.values.gender,
      r.values.mobile,
      r.values.whatsapp,
      `"${r.values.village}"`,
      `"${r.values.block}"`,
      `"${r.values.district}"`,
      `"${r.values.allergy || 'None'}"`,
      r.companions.length,
      r.status,
      new Date(r.createdAt).toLocaleString('en-IN'),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Chunri_Yatra_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="app-shell admin-shell">
      <CinematicCosmosCanvas />
      <div className="app-frame">
        <div className="app-toolbar">
          <p className="top-mark">✦ ।। श्री नर्मदे हर ।। ✦</p>
          <div className="toolbar-actions">
            <button className="admin-button" type="button" onClick={onLogout}>
              <X size={14} /> Logout
            </button>
          </div>
        </div>

        <section className="admin-card">
          <header className="admin-hero">
            <div className="admin-hero-brand">
              <p className="sacred-line">।। त्वदीय पाद पंकजं नमामि देवि नर्मदे ।।</p>
              <img
                className="admin-panel-logo"
                src="/registration-logo.png"
                alt="श्री माँ नर्मदा भक्त परिवार"
              />
              <p className="admin-hero-subtitle">श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा — Admin Control Portal</p>
            </div>
            <div className="admin-hero-icon-wrap">
              <ClipboardList size={38} strokeWidth={1.5} />
            </div>
          </header>

          <div className="admin-body">
            <div className="admin-heading-row">
              <div>
                <h2>
                  <UsersRound size={22} /> पंजीकृत यात्री डेटाबेस
                  <span className={`live-server-badge ${isSyncing ? 'syncing' : 'active'}`} title="मल्टी-डिवाइस सेंट्रल सर्वर सिंक सक्रिय है">
                    <span className="live-pulse-dot" />
                    {isSyncing ? 'सर्वर सिंक हो रहा है...' : 'लाइव सर्वर कनेक्टेड'}
                  </span>
                </h2>
                <p>सभी 255 मीटर चुनरी यात्रियों एवं परिजनों का रीयल-टाइम केंद्रीय रिकॉर्ड (भक्तों के स्व-पंजीयन सीधे यहाँ दिखाई देते हैं)</p>
              </div>
              <div className="admin-top-btns">
                {onRefresh && (
                  <button
                    className={`refresh-sync-button ${isSyncing ? 'is-spinning' : ''}`}
                    type="button"
                    onClick={() => {
                      holyAudio.playRipple();
                      onRefresh();
                    }}
                    title="सर्वर से नवीनतम पंजीयन रीयल-टाइम रिफ्रेश करें"
                  >
                    <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
                    {isSyncing ? 'रिफ्रेशिंग...' : 'लाइव रिफ्रेश'}
                  </button>
                )}
                <button
                  className="qr-pass-btn"
                  type="button"
                  onClick={() => {
                    holyAudio.playRipple();
                    onOpenQrPass();
                  }}
                  title="सभी भक्तों के डिजिटल QR पास जनरेट करें"
                >
                  <QrCode size={14} /> 🎫 QR पास जनरेटर
                </button>
                <button
                  className="qr-pass-btn"
                  type="button"
                  onClick={() => {
                    holyAudio.playRipple();
                    if (onOpenSeatMap) onOpenSeatMap();
                  }}
                  title="255M चुनरी सीट बुकिंग मैप देखें"
                >
                  <Compass size={14} /> 💺 लाइव सीट मैप
                </button>
                <button
                  className="ai-report-btn"
                  type="button"
                  onClick={() => {
                    holyAudio.playRipple();
                    setIsReportOpen(true);
                  }}
                  title="Gemini Pro AI द्वारा आयोजन रिपोर्ट तैयार करें"
                >
                  <Sparkles size={14} /> ✨ AI आयोजन रिपोर्ट
                </button>
                <button className="csv-export-button" type="button" onClick={exportCSV}>
                  <Download size={15} /> Export CSV
                </button>
                <button className="public-form-button" type="button" onClick={onBack}>
                  <Plus size={16} /> New Registration
                </button>
              </div>
            </div>

            <div className="admin-stats">
              <div className="admin-stat">
                <span className="stat-label">कुल पंजीकृत</span>
                <strong className="stat-value">{records.length}</strong>
              </div>
              <div className="admin-stat verified-stat">
                <span className="stat-label">सत्यापित (Checked)</span>
                <strong className="stat-value">{checkedCount}</strong>
              </div>
              <div className="admin-stat pending-stat">
                <span className="stat-label">लंबित समीक्षा</span>
                <strong className="stat-value">{records.length - checkedCount}</strong>
              </div>
              <div className="admin-stat volunteer-stat">
                <span className="stat-label">🛡️ स्वयंसेवक आवेदन</span>
                <strong className="stat-value">{pendingVolunteersCount}</strong>
              </div>
              <div className="admin-stat chunri-stat">
                <span className="stat-label">255m उपलब्ध स्लॉट</span>
                <strong className="stat-value">{Math.max(0, CHUNRI_CAPACITY - records.length)}</strong>
              </div>
            </div>

            {/* Volunteer & Devotee Category Filter Tabs */}
            <div className="admin-filter-tabs">
              <button
                type="button"
                className={`admin-filter-pill ${volunteerFilter === 'all' ? 'active' : ''}`}
                onClick={() => setVolunteerFilter('all')}
              >
                सभी यात्री ({records.length})
              </button>
              <button
                type="button"
                className={`admin-filter-pill pending-pill ${volunteerFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setVolunteerFilter('pending')}
              >
                ⏳ स्वयंसेवक समीक्षा ({pendingVolunteersCount})
              </button>
              <button
                type="button"
                className={`admin-filter-pill approved-pill ${volunteerFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setVolunteerFilter('approved')}
              >
                ✅ स्वीकृत स्वयंसेवक ({approvedVolunteersCount})
              </button>
              <button
                type="button"
                className={`admin-filter-pill normal-pill ${volunteerFilter === 'normal' ? 'active' : ''}`}
                onClick={() => setVolunteerFilter('normal')}
              >
                🚩 सामान्य श्रद्धालु
              </button>
            </div>

            <label className="admin-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="नाम, मोबाइल, गाँव या जिला खोजें..."
                aria-label="Search registrations"
              />
              {query && (
                <button type="button" className="search-clear-btn" onClick={() => setQuery('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {filteredRecords.length === 0 ? (
              <div className="admin-empty">
                <ClipboardList size={42} />
                <h3>{records.length ? 'कोई मेल नहीं मिला' : 'अभी कोई पंजीयन नहीं है'}</h3>
                <p>
                  {records.length
                    ? 'अपनी खोज बदलकर फिर से प्रयास करें।'
                    : 'पंजीयन फॉर्म से पहला भक्त पंजीयन दर्ज करें।'}
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
                        📞 {record.values.mobile} <span>•</span> 📍 {record.values.village}, {record.values.district}
                      </p>
                      <small>
                        पिता: {record.values.fatherName} <span>•</span> आयु: {record.values.age} वर्ष <span>•</span>{' '}
                        {record.companions.length > 0 ? `+${record.companions.length} सह-यात्री` : 'अकेले'}
                      </small>
                      <div className="record-allocation-badge">
                        <Ruler size={12} />
                        {record.allocation.isPendingApproval ? (
                          <strong className="pending-slot-text">⏳ स्लॉट: व्यवस्थापक सत्यापन प्रतीक्षारत (Zone 2)</strong>
                        ) : (
                          <>
                            <strong>स्लॉट #{record.allocation.slotNumber}</strong> —{' '}
                            {record.allocation.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'} से {record.allocation.distanceFeet} ft ({record.allocation.distanceMeters}m)
                            {record.allocation.zoneName && (
                              <span className="record-zone-tag"> • {record.allocation.zoneName}</span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Volunteer Review Alert for Admin */}
                      {(record.allocation.isPendingApproval || record.volunteerStatus === 'pending') && (
                        <div className="volunteer-pending-admin-alert">
                          <div className="alert-content">
                            <span className="pending-shield-icon">🛡️</span>
                            <div>
                              <strong>स्वयंसेवक आवेदन (सत्यापन आवश्यक)</strong>
                              <p>स्वीकृत करने पर जोन २ (50-100m) में स्लॉट आवंटित होगा। अस्वीकृत करने पर आयु/लिंग अनुसार अन्य ज़ोन में स्वतः शिफ्ट होगा।</p>
                            </div>
                          </div>
                          <div className="volunteer-decision-btns">
                            <button
                              type="button"
                              className="volunteer-approve-btn"
                              onClick={() => onApproveVolunteer(record.id)}
                              title="स्वयंसेवक के रूप में स्वीकृत करें (ज़ोन २ स्लॉट आवंटित करें)"
                            >
                              <Check size={14} /> स्वीकृत करें (Zone 2)
                            </button>
                            <button
                              type="button"
                              className="volunteer-reject-btn"
                              onClick={() => onRejectVolunteer(record.id)}
                              title="अस्वीकृत कर आयु/लिंग अनुसार अन्य जोन में स्वतः शिफ्ट करें"
                            >
                              <X size={14} /> अस्वीकृत करें (Shift Zone)
                            </button>
                          </div>
                        </div>
                      )}

                      {record.volunteerStatus === 'approved' && (
                        <div className="volunteer-approved-badge">
                          <CheckCircle2 size={13} /> स्वीकृत स्वयंसेवक (जोन २: 50-100 मीटर)
                          <button
                            type="button"
                            className="volunteer-revert-btn"
                            onClick={() => onRejectVolunteer(record.id)}
                            title="अस्वीकृत कर आयु/लिंग अनुसार सामान्य ज़ोन में अंतरित करें"
                          >
                            ज़ोन अंतरित करें
                          </button>
                        </div>
                      )}

                      {record.volunteerStatus === 'rejected' && (
                        <div className="volunteer-rejected-badge">
                          <Info size={13} /> स्वयंसेवक अस्वीकृत • आयु/लिंग अनुसार {record.allocation.zoneName || 'अन्य जोन'} में अंतरित
                          <button
                            type="button"
                            className="volunteer-reapprove-btn"
                            onClick={() => onApproveVolunteer(record.id)}
                            title="पुनः ज़ोन २ में स्वीकृत करें"
                          >
                            पुनः ज़ोन २ में स्वीकृत करें
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="record-date">
                      {new Date(record.createdAt).toLocaleDateString('hi-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="record-actions">
                      <button
                        className="record-action qr-action"
                        type="button"
                        onClick={() => {
                          holyAudio.playRipple();
                          onOpenQrPass(record);
                        }}
                        title="डिजिटल QR पास जनरेट / डाउनलोड करें"
                      >
                        <QrCode size={15} />
                      </button>
                      <button
                        className={`record-action check-action ${record.status === 'checked' ? 'active' : ''}`}
                        type="button"
                        onClick={() => {
                          holyAudio.playRipple();
                          onToggleStatus(record.id);
                        }}
                        title={record.status === 'checked' ? 'Mark as new' : 'Mark as checked'}
                      >
                        <Check size={15} />
                      </button>
                      <button
                        className="record-action edit-action"
                        type="button"
                        onClick={() => {
                          holyAudio.playRipple();
                          onEdit(record);
                        }}
                        title="Edit registration"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="record-action delete-action"
                        type="button"
                        onClick={() => {
                          holyAudio.playRipple();
                          onDelete(record.id);
                        }}
                        title="Delete registration"
                      >
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

      <AdminReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        records={records}
      />
    </main>
  );
}

// Cinematic Yatri Pass / Chunri Sankalp Patra
function ChunriAllocationCard({
  allocation,
  record,
  isUpdate,
  onNewRegistration,
  onAdmin,
  onOpenQrPass,
}: {
  allocation: Allocation;
  record?: FormValues;
  isUpdate: boolean;
  onNewRegistration: () => void;
  onAdmin: () => void;
  onOpenQrPass: () => void;
}) {
  const devoteeName = record?.name || 'माँ नर्मदा के भक्त';
  const [customSankalp, setCustomSankalp] = useState('');
  const [cardQrUrl, setCardQrUrl] = useState('');

  useEffect(() => {
    if (record) {
      QRCode.toDataURL(
        JSON.stringify({
          event: 'Maa Narmada Chunri Yatra 2026',
          name: record.name,
          mobile: record.mobile,
          slot: allocation.slotNumber,
          side: allocation.side,
          dist: `${allocation.distanceFeet}ft`,
          verified: true,
        }),
        { width: 160, margin: 1, color: { dark: '#1e3a1e', light: '#ffffff' } }
      ).then(setCardQrUrl).catch(() => {});
    }
  }, [record, allocation]);

  const shareOnWhatsApp = () => {
    holyAudio.playRipple();
    const blessingSnippet = customSankalp ? `\n\n📜 *पावन संकल्प:*\n${customSankalp}\n` : '';
    const slotInfo = allocation.isPendingApproval
      ? `🛡️ *स्वयंसेवक आवेदन:* व्यवस्थापक सत्यापन प्रतीक्षारत (स्वीकृति उपरांत ज़ोन २: 50-100m में स्लॉट मिलेगा)`
      : `🚩 *चुनरी स्थान:* स्लॉट #${allocation.slotNumber}\n📏 *दूरी:* ${allocation.side === 'left' ? 'बाएँ छोर' : 'दाएँ छोर'} से ${allocation.distanceFeet} फीट (${allocation.distanceMeters} मीटर)`;
    const text = encodeURIComponent(
      `🚩 *।। नर्मदे हर ।।* 🚩\n\nमैंने *श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा 2026* में 255 मीटर की विशाल चुनरी धारण करने हेतु अपना पंजीयन करा लिया है!\n\n` +
      `👤 *यात्री:* ${devoteeName}\n` +
      `${slotInfo}\n` +
      `✨ *लंबाई:* 255 मीटर विशाल चुनरी${blessingSnippet}\n` +
      `माँ नर्मदा का पावन आशीर्वाद आप सभी पर सदैव बना रहे! 🙏`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    holyAudio.playRipple();
    window.print();
  };

  const handleRingBell = () => {
    holyAudio.playTempleChime();
  };

  return (
    <section className="registration-card chunri-success-card" data-testid="status-registration-success">
      <div className="celebration-particles" aria-hidden="true">
        <span className="sparkle s1">✨</span>
        <span className="sparkle s2">🚩</span>
        <span className="sparkle s3">🌸</span>
        <span className="sparkle s4">✨</span>
      </div>

      <div className="chunri-emblem-wrap">
        <div className="chunri-emblem" onClick={handleRingBell} title="माँ नर्मदा का पावन शंख व घंटी">
          <Sparkles size={34} />
        </div>
        <button type="button" className="bell-ring-chip" onClick={handleRingBell}>
          🔔 घंटी बजाएं (Ring Bell)
        </button>
      </div>

      <p className="chunri-kicker">✦ श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा ✦</p>
      <h1 className="cinematic-success-title">
        {isUpdate ? 'पंजीयन नवीनीकृत हुआ!' : 'पंजीयन सफलतापूर्वक संपन्न!'}
      </h1>

      <p className="chunri-success-copy">
        {isUpdate
          ? 'आपके यात्रा विवरण को अद्यतन कर दिया गया है।'
          : 'माँ रेवा की कृपा से आपका पावन संकल्प स्वीकार हुआ। आपके लिए चुनरी पकड़ने का स्थान स्वतः आरक्षित कर दिया गया है।'}
      </p>

      {/* Cinematic Chunri Ribbon Visualizer */}
      <div className="chunri-ribbon">
        <div className="ribbon-end left-end">
          <span>आरंभ (बायाँ)</span>
        </div>
        <div className="ribbon-track">
          {!allocation.isPendingApproval && (
            <span
              className={`allocation-marker ${allocation.side}`}
              style={{
                left: allocation.side === 'left' ? `${Math.min(92, Math.max(8, (allocation.distanceFeet / (CHUNRI_LENGTH_FEET / 2)) * 100))}%` : undefined,
                right: allocation.side === 'right' ? `${Math.min(92, Math.max(8, (allocation.distanceFeet / (CHUNRI_LENGTH_FEET / 2)) * 100))}%` : undefined,
              }}
            >
              <span className="marker-pin">📍</span>
            </span>
          )}
          <span className="ribbon-label">✦ 255 METERS HOLY CHUNRI ✦</span>
        </div>
        <div className="ribbon-end right-end">
          <span>अंत (दायाँ)</span>
        </div>
      </div>

      {/* The Printable VIP Chunri Yatri Pass */}
      <div className="allocation-card printable-pass">
        <div className="pass-watermark">नर्मदे हर</div>

        <div className="allocation-ticket-meta">
          <div className="pass-brand">
            <span className="pass-flag">🚩</span>
            <span className="pass-brand-text">श्री माँ नर्मदा चुनरी यात्रा संकल्प पत्र</span>
          </div>
          <span className="pass-tag">VIP PASS</span>
        </div>

        <div className="pass-devotee-strip">
          <span className="devotee-label">मुख्य भक्त / यात्री:</span>
          <span className="devotee-name">{devoteeName}</span>
        </div>

        <div className="pass-slot-highlight">
          <span className="allocation-caption">माँ नर्मदा चुनरी सेवा स्थान</span>
          {allocation.isPendingApproval ? (
            <div className="pending-volunteer-pass-banner">
              <strong className="slot-number-big pending-title">⏳ स्वयंसेवक सत्यापन प्रतीक्षारत</strong>
              <span className="pass-zone-tag">जोन २: समर्पित स्वयंसेवक/व्यवस्थापक दल (50 - 100 मीटर)</span>
            </div>
          ) : (
            <>
              <strong className="slot-number-big">स्लॉट #{allocation.slotNumber}</strong>
              <span className="pass-zone-tag">
                {allocation.zoneName || (allocation.slotNumber ? getZoneBySlotNumber(allocation.slotNumber).name : 'जोन २: स्वयंसेवक/स्वयंसेविकाएं')}
              </span>
            </>
          )}
        </div>

        {allocation.isPendingApproval && (
          <div className="volunteer-pass-notice-box">
            <div className="notice-icon-large">🛡️</div>
            <div>
              <strong>व्यवस्थापक द्वारा स्वीकृति उपरांत स्लॉट आवंटित होगा</strong>
              <p>
                आपका स्वयंसेवक आवेदन व्यवस्थापक समीक्षा हेतु दर्ज कर लिया गया है। व्यवस्थापक द्वारा स्वीकृति मिलते ही ज़ोन २ में आपका स्लॉट नंबर आवंटित कर दिया जाएगा। यदि किसी कारणवश स्वयंसेवक आवेदन निरस्त होता है, तो आपकी आयु व लिंग अनुसार सामान्य ज़ोन (1, 3 या 4) में स्वतः स्लॉट आवंटित हो जाएगा।
              </p>
            </div>
          </div>
        )}

        <div className="ticket-divider" />

        <div className="pass-details-grid">
          <div className="pass-col">
            <span className="pass-col-label">आवंटित जोन व वर्ग</span>
            <strong className="pass-col-val highlight-gold">
              {allocation.zoneCategory || (allocation.slotNumber ? getZoneBySlotNumber(allocation.slotNumber).targetCategory : 'समर्पित स्वयंसेवक एवं व्यवस्थापक दल')}
            </strong>
          </div>
          <div className="pass-col">
            <span className="pass-col-label">दिशा / छोर</span>
            <strong className="pass-col-val">
              {allocation.isPendingApproval
                ? 'सत्यापन उपरांत निर्धारित होगा'
                : allocation.side === 'left'
                ? 'बायाँ छोर (Left End)'
                : 'दायाँ छोर (Right End)'}
            </strong>
          </div>
          <div className="pass-col">
            <span className="pass-col-label">दूरी (Distance)</span>
            <strong className="pass-col-val">
              {allocation.isPendingApproval
                ? 'स्वीकृति उपरांत निर्धारित होगी'
                : `${allocation.distanceFeet} फीट (${allocation.distanceMeters} मीटर)`}
            </strong>
          </div>
        </div>

        {/* Gemini Pro Personalized Divine Sankalp Card */}
        {record && (
          <PersonalizedDivineSankalpBox
            devotee={{
              name: record.name,
              fatherName: record.fatherName,
              motherName: record.motherName,
              village: record.village,
              district: record.district,
              age: record.age,
            }}
            slot={allocation}
            onSankalpGenerated={(text) => setCustomSankalp(text)}
          />
        )}

        {/* Pass QR Code Live Badge */}
        <div className="pass-qr-strip">
          {cardQrUrl && (
            <div className="card-qr-box" onClick={onOpenQrPass} title="क्लिक कर डिजिटल QR पास डाउनलोड करें">
              <img src={cardQrUrl} alt="QR Code" className="card-qr-img" />
              <span className="card-qr-label">
                <ShieldCheck size={11} /> डिजिटल सत्यापन QR
              </span>
            </div>
          )}
          <div className="card-qr-cta">
            <button
              type="button"
              className="card-qr-btn"
              onClick={onOpenQrPass}
            >
              <QrCode size={15} />
              <span>🎫 डिजिटल QR पास (PNG) डाउनलोड करें</span>
            </button>
            <small>प्रवेश द्वार पर त्वरित स्कैनिंग व सत्यापन हेतु मान्य</small>
          </div>
        </div>

        <div className="pass-sacred-footer">
          <span className="blessing-text">।। त्वदीय पाद पंकजं नमामि देवि नर्मदे ।।</span>
        </div>
      </div>

      <p className="spacing-note">
        <ShieldCheck size={16} /> दोनों सिरों से हर 2 फीट पर एक-एक भक्त का व्यवस्थित क्रम
      </p>

      {/* Cinematic Actions */}
      <div className="thank-actions">
        <button className="qr-pass-action-btn" type="button" onClick={onOpenQrPass}>
          <QrCode size={16} /> 🎫 डिजिटल QR पास जनरेटर
        </button>
        <button className="whatsapp-share-btn" type="button" onClick={shareOnWhatsApp}>
          <Share2 size={16} /> WhatsApp पर शेयर करें
        </button>
        <button className="print-pass-btn" type="button" onClick={handlePrint}>
          <Printer size={16} /> पास प्रिंट करें
        </button>
        <button className="back-button" type="button" onClick={onNewRegistration}>
          <Plus size={16} /> नया पंजीयन करें
        </button>
        <button className="outline-button" type="button" onClick={onAdmin}>
          <ClipboardList size={16} /> Admin Portal
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
  const [isMuted, setIsMuted] = useState(false);

  // Gemini AI Modals
  const [isAutoFillOpen, setIsAutoFillOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // QR Pass Modal
  const [isQrPassOpen, setIsQrPassOpen] = useState(false);
  const [qrPassRecord, setQrPassRecord] = useState<RegistrationRecord | null>(null);

  // Modern Flight-Style Chunri Seat Map Selection
  const [customSelectedSlot, setCustomSelectedSlot] = useState<number | null>(null);
  const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);

  const openQrPass = (record?: RegistrationRecord) => {
    setQrPassRecord(record || null);
    setIsQrPassOpen(true);
  };

  const [view, setView] = useState<View>(() => (
    new URLSearchParams(window.location.search).get('admin') === '1'
      ? 'admin-login'
      : 'form'
  ));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [records, setRecords] = useState<RegistrationRecord[]>(getStoredRecords);
  const [lastAllocation, setLastAllocation] = useState<Allocation | null>(null);
  const [capacityError, setCapacityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronize and fetch records from central multi-device server
  const loadServerRecords = async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const serverRecords = await fetchServerRegistrations();
      if (serverRecords && Array.isArray(serverRecords)) {
        setRecords(serverRecords);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serverRecords));
      }
    } catch (e) {
      console.warn('Central server sync failed, keeping local records', e);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Sync any existing local records to central server on first load
    const local = getStoredRecords();
    if (local.length > 0) {
      syncLocalRecordsToServer(local)
        .then((merged) => {
          if (Array.isArray(merged) && merged.length > 0) {
            setRecords(merged);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
        })
        .catch(() => {
          loadServerRecords(true);
        });
    } else {
      loadServerRecords(false);
    }

    // 2. Real-time background poll (every 4 seconds) so devotee self-registrations instantly appear for admin
    const timer = setInterval(() => {
      loadServerRecords(true);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const toggleSound = () => {
    const muted = holyAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      holyAudio.playRipple();
    }
  };

  const handleRingBell = () => {
    holyAudio.playTempleChime();
  };

  const update = (key: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleAiAutoFillApply = (extracted: ExtractedFormValues) => {
    setValues((current) => ({
      ...current,
      name: extracted.name || current.name,
      fatherName: extracted.fatherName || current.fatherName,
      motherName: extracted.motherName || current.motherName,
      age: extracted.age ? String(extracted.age) : current.age,
      gender: extracted.gender || current.gender,
      mobile: extracted.mobile || current.mobile,
      whatsapp: extracted.whatsapp || extracted.mobile || current.whatsapp,
      village: extracted.village || current.village,
      block: extracted.block || current.block,
      district: extracted.district || current.district,
      allergy: extracted.allergy || current.allergy,
    }));

    if (extracted.mobile && !extracted.whatsapp) {
      setSameWhatsapp(true);
    }

    setErrors({});
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
    if (values.mobile && !/^[0-9]{10}$/.test(values.mobile)) next.mobile = '10 अंकों का मान्य मोबाइल नंबर लिखें';
    if (values.whatsapp && !/^[0-9]{10}$/.test(values.whatsapp)) next.whatsapp = '10 अंकों का मान्य व्हाट्सऐप नंबर लिखें';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      holyAudio.playRipple();
      const firstError = document.querySelector('.has-error, .field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    holyAudio.playTempleChime();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const existingRecord = records.find((record) => record.id === editingId);
        let updatedAllocation = existingRecord?.allocation;
        let updatedVolunteerStatus = existingRecord?.volunteerStatus || 'none';

        // Check if volunteer status changed during edit
        const isNowVolunteer = Boolean(values.isVolunteer);
        const wasVolunteer = Boolean(
          existingRecord?.values?.isVolunteer ||
          existingRecord?.volunteerStatus === 'pending' ||
          existingRecord?.volunteerStatus === 'approved'
        );

        if (isNowVolunteer && !wasVolunteer) {
          // Devotee applied to be a volunteer: requires Admin verification, slot 0
          updatedAllocation = createPendingVolunteerAllocation();
          updatedVolunteerStatus = 'pending';
        } else if (!isNowVolunteer && wasVolunteer) {
          // Devotee opted out of volunteer: automatically shift to demographic natural zone
          const naturalZone = getNaturalZoneByDemographics(values.gender, values.age);
          const occupied = new Set<number>();
          records.forEach((r) => {
            if (r.id !== editingId && r.allocation?.slotNumber && !r.allocation.isPendingApproval) {
              occupied.add(r.allocation.slotNumber);
            }
          });
          const targetSlot = customSelectedSlot || findNextAvailableSlotInZone(naturalZone, occupied);
          updatedAllocation = getAllocationForSlot(targetSlot);
          updatedVolunteerStatus = 'none';
        } else if (!isNowVolunteer && customSelectedSlot && customSelectedSlot !== existingRecord?.allocation?.slotNumber) {
          // Custom slot changed during edit
          updatedAllocation = getAllocationForSlot(customSelectedSlot);
        }

        if (updatedAllocation) setLastAllocation(updatedAllocation);

        const updatePayload: Partial<RegistrationRecord> = {
          values,
          companions,
          volunteerStatus: updatedVolunteerStatus,
          allocation: updatedAllocation,
        };

        // Save update to central server
        await updateServerRegistration(editingId, updatePayload).catch((err) => {
          console.warn('Server update error, will save locally', err);
        });

        setRecords((current) =>
          current.map((record) =>
            record.id === editingId
              ? { ...record, ...updatePayload }
              : record,
          ),
        );
      } else {
        const isVolunteerApplicant = Boolean(values.isVolunteer);

        let candidateAllocation: Allocation;
        let candidateVolunteerStatus: VolunteerStatus = 'none';

        if (isVolunteerApplicant) {
          // Volunteer registration: Slot is NOT assigned until Admin verifies/rejects!
          candidateAllocation = createPendingVolunteerAllocation();
          candidateVolunteerStatus = 'pending';
        } else {
          // Regular non-volunteer applicant -> auto allocate slot according to age/gender or custom seat!
          const isCustomTaken = customSelectedSlot
            ? records.some((r) => r.allocation?.slotNumber === customSelectedSlot && !r.allocation.isPendingApproval)
            : false;

          let targetSlot = customSelectedSlot && !isCustomTaken ? customSelectedSlot : null;
          if (!targetSlot) {
            const autoZone = determineZoneForDevotee({
              gender: values.gender,
              age: values.age,
              isVolunteer: false,
            });
            const occupied = new Set<number>();
            records.forEach((r) => {
              if (r.allocation?.slotNumber && !r.allocation.isPendingApproval) {
                occupied.add(r.allocation.slotNumber);
              }
            });
            targetSlot = findNextAvailableSlotInZone(autoZone, occupied);
          }

          if (targetSlot > CHUNRI_CAPACITY) {
            setCapacityError('255 मीटर की चुनरी के सभी स्थान भर चुके हैं।');
            setIsSubmitting(false);
            return;
          }

          candidateAllocation = getAllocationForSlot(targetSlot);
          candidateVolunteerStatus = 'none';
        }

        const newRecordPayload: RegistrationRecord = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          status: 'new' as const,
          volunteerStatus: candidateVolunteerStatus,
          values,
          companions,
          allocation: candidateAllocation,
        };

        // Send to central server so admin immediately sees it across all devices!
        let finalRecord = newRecordPayload;
        try {
          const serverCreated = await createServerRegistration(newRecordPayload);
          if (serverCreated && serverCreated.id) {
            finalRecord = serverCreated;
          }
        } catch (serverErr) {
          console.warn('Server registration save error, saved locally for sync', serverErr);
        }

        setLastAllocation(finalRecord.allocation);
        setCapacityError('');
        setRecords((current) => [finalRecord, ...current.filter((r) => r.id !== finalRecord.id)]);
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobile = (value: string) => {
    const mobile = value.replace(/\D/g, '').slice(0, 10);
    setValues((current) => ({ ...current, mobile, ...(sameWhatsapp ? { whatsapp: mobile } : {}) }));
    setErrors((current) => ({ ...current, mobile: undefined, ...(sameWhatsapp ? { whatsapp: undefined } : {}) }));
  };

  const addCompanion = () => {
    holyAudio.playRipple();
    setCompanions((current) => [
      ...current,
      { id: Date.now(), name: '', age: '', gender: '', relation: '' },
    ]);
  };

  const updateCompanion = (id: number, key: keyof Companion, value: string) => {
    setCompanions((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const resetForm = () => {
    holyAudio.playRipple();
    setValues(initialForm);
    setCompanions([]);
    setErrors({});
    setSubmitted(false);
    setSameWhatsapp(false);
    setEditingId(null);
    setLastAllocation(null);
    setCapacityError('');
    setCustomSelectedSlot(null);
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

  const deleteRecord = async (id: string) => {
    if (window.confirm('क्या आप इस पंजीयन को हटाना चाहते हैं?')) {
      holyAudio.playRipple();
      setRecords((current) => current.filter((record) => record.id !== id));
      try {
        await deleteServerRegistration(id);
      } catch (e) {
        console.warn('Failed to delete on server', e);
      }
    }
  };

  const toggleRecordStatus = async (id: string) => {
    holyAudio.playRipple();
    const target = records.find((r) => r.id === id);
    const newStatus = target?.status === 'checked' ? 'new' : 'checked';
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, status: newStatus }
          : record,
      ),
    );
    try {
      await updateServerRegistration(id, { status: newStatus });
    } catch (e) {
      console.warn('Failed to update status on server', e);
    }
  };

  const occupiedSlotsSet = useMemo(() => {
    const set = new Set<number>();
    records.forEach((r) => {
      if (r.allocation?.slotNumber && !r.allocation.isPendingApproval) {
        set.add(r.allocation.slotNumber);
      }
    });
    return set;
  }, [records]);

  // Determine Zone automatically based on Age, Gender and Volunteer choice
  const applicantZone = useMemo(() => {
    return determineZoneForDevotee({
      gender: values.gender,
      age: values.age,
      isVolunteer: values.isVolunteer,
    });
  }, [values.gender, values.age, values.isVolunteer]);

  // Automatic next available slot in this designated zone
  const autoZoneSlot = useMemo(() => {
    return findNextAvailableSlotInZone(applicantZone, occupiedSlotsSet);
  }, [applicantZone, occupiedSlotsSet]);

  const activeSelectedSlot = customSelectedSlot || autoZoneSlot;
  const activeAllocation = getAllocationForSlot(activeSelectedSlot);

  const approveVolunteer = async (id: string) => {
    holyAudio.playTempleChime();
    const target = records.find((r) => r.id === id);
    if (!target) return;

    // Find next available slot in Zone 2 (50-100m)
    const occupied = new Set<number>();
    records.forEach((r) => {
      if (r.id !== id && r.allocation?.slotNumber && !r.allocation.isPendingApproval) {
        occupied.add(r.allocation.slotNumber);
      }
    });

    const zone2 = CHUNRI_ZONES[1]; // Zone 2: 50-100m
    const newSlot = findNextAvailableSlotInZone(zone2, occupied);
    const newAllocation = getAllocationForSlot(newSlot);
    newAllocation.isPendingApproval = false;

    const updatedRecord: RegistrationRecord = {
      ...target,
      volunteerStatus: 'approved',
      allocation: newAllocation,
    };

    setRecords((current) => current.map((r) => (r.id === id ? updatedRecord : r)));
    try {
      await updateServerRegistration(id, {
        volunteerStatus: 'approved',
        allocation: newAllocation,
      });
    } catch (e) {
      console.warn('Failed to update volunteer approval on server', e);
    }
  };

  const rejectVolunteer = async (id: string) => {
    holyAudio.playRipple();
    const target = records.find((r) => r.id === id);
    if (!target) return;

    // Reject volunteer: Shift to natural demographic zone (Zone 1, 3, or 4) based on age & gender
    const naturalZone = getNaturalZoneByDemographics(target.values.gender, target.values.age);

    const occupied = new Set<number>();
    records.forEach((r) => {
      if (r.id !== id && r.allocation?.slotNumber && !r.allocation.isPendingApproval) {
        occupied.add(r.allocation.slotNumber);
      }
    });

    const newSlot = findNextAvailableSlotInZone(naturalZone, occupied);
    const newAllocation = getAllocationForSlot(newSlot);
    newAllocation.isPendingApproval = false;

    const updatedRecord: RegistrationRecord = {
      ...target,
      volunteerStatus: 'rejected',
      values: { ...target.values, isVolunteer: false },
      allocation: newAllocation,
    };

    setRecords((current) => current.map((r) => (r.id === id ? updatedRecord : r)));
    try {
      await updateServerRegistration(id, {
        volunteerStatus: 'rejected',
        values: { ...target.values, isVolunteer: false },
        allocation: newAllocation,
      });
    } catch (e) {
      console.warn('Failed to update volunteer rejection on server', e);
    }
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
        isSyncing={isSyncing}
        onRefresh={() => loadServerRecords(false)}
        onOpenQrPass={(rec) => openQrPass(rec)}
        onOpenSeatMap={() => setIsSeatMapModalOpen(true)}
        onApproveVolunteer={approveVolunteer}
        onRejectVolunteer={rejectVolunteer}
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

  if (submitted && lastAllocation) {
    return (
      <main className="app-shell">
        <CinematicCosmosCanvas />
        <div className="app-frame">
          <div className="app-toolbar">
            <p className="top-mark">✦ ।। नर्मदे हर ।। ✦</p>
            <div className="toolbar-actions">
              <button
                className="ai-guide-pill-btn"
                type="button"
                onClick={() => {
                  holyAudio.playRipple();
                  setIsChatOpen(true);
                }}
              >
                <Sparkles size={14} /> <span>नर्मदा एआई सहायक</span>
              </button>
              <button
                className="audio-button"
                type="button"
                onClick={toggleSound}
                title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isMuted ? 'Muted' : 'Sound'}</span>
              </button>
              <button className="admin-button" type="button" onClick={() => setView('admin-login')}>
                <ClipboardList size={15} /> Admin Portal
              </button>
            </div>
          </div>
          <ChunriAllocationCard
            allocation={lastAllocation}
            record={values}
            isUpdate={Boolean(editingId)}
            onNewRegistration={resetForm}
            onOpenQrPass={() =>
              openQrPass({
                id: editingId || makeId(),
                createdAt: new Date().toISOString(),
                status: 'new',
                values,
                companions,
                allocation: lastAllocation,
              })
            }
            onAdmin={() => {
              setSubmitted(false);
              setView('admin-login');
            }}
          />
        </div>

        <NarmadaAiChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <CinematicCosmosCanvas />

      <div className="app-frame">
        {/* Cinematic Floating Toolbar */}
        <div className="app-toolbar">
          <div className="sacred-mantra-pill" onClick={handleRingBell} title="क्लिक कर घंटी बजाएं">
            <span className="om-symbol">ॐ</span>
            <span className="top-mark">।। श्री नर्मदे हर ।।</span>
            <span className="bell-spark">🔔</span>
          </div>

          <div className="toolbar-actions">
            <button
              className="seatmap-pill-btn"
              type="button"
              onClick={() => {
                holyAudio.playRipple();
                setIsSeatMapModalOpen(true);
              }}
              title="255M चुनरी सीट बुकिंग मैप (हवाई जहाज सीट शैली)"
            >
              <Compass size={14} /> <span>💺 चुनरी सीट मैप</span>
            </button>
            <button
              className="qr-pass-pill-btn"
              type="button"
              onClick={() => {
                holyAudio.playRipple();
                openQrPass();
              }}
              title="डिजिटल QR पास जनरेटर / पास खोजें"
            >
              <QrCode size={14} /> <span>QR पास</span>
            </button>
            <button
              className="ai-guide-pill-btn"
              type="button"
              onClick={() => {
                holyAudio.playRipple();
                setIsChatOpen(true);
              }}
              title="माँ नर्मदा एआई मार्गदर्शक से बातचीत करें"
            >
              <Sparkles size={14} /> <span>नर्मदा एआई</span>
            </button>
            <button
              className="audio-button"
              type="button"
              onClick={toggleSound}
              title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isMuted ? 'Muted' : 'Sound'}</span>
            </button>
            <button
              className="settings-icon-btn"
              type="button"
              onClick={() => {
                holyAudio.playRipple();
                setIsSettingsOpen(true);
              }}
              title="Gemini AI सेटिंग्स"
            >
              <Key size={14} />
            </button>
            <button className="admin-button" type="button" onClick={() => setView('admin-login')}>
              <LockKeyhole size={13} /> Admin
            </button>
          </div>
        </div>

        {/* Live Telemetry Ticker */}
        <div className="cinematic-telemetry-bar">
          <div className="telemetry-item">
            <span className="telemetry-badge">🚩 255M</span>
            <span className="telemetry-text">विशाल चुनरी</span>
          </div>
          <div className="telemetry-divider" />
          <div className="telemetry-item">
            <span className="telemetry-badge">👥 417</span>
            <span className="telemetry-text">कुल भक्त क्षमता</span>
          </div>
          <div className="telemetry-divider" />
          <div className="telemetry-item">
            <span className="telemetry-badge pulse-gold">✨ {records.length}</span>
            <span className="telemetry-text">पंजीकृत</span>
          </div>
          <div className="telemetry-divider" />
          <div className="telemetry-item highlight-item">
            <span className="telemetry-badge">⚡ {Math.max(0, CHUNRI_CAPACITY - records.length)}</span>
            <span className="telemetry-text">स्थान शेष</span>
          </div>
        </div>

        {editingId && (
          <div className="editing-notice">
            <Pencil size={15} /> <strong>संशोधन मोड:</strong> आप पंजीयन विवरण अपडेट कर रहे हैं
            <button type="button" onClick={resetForm} aria-label="Cancel editing">
              <X size={15} /> रद्द करें
            </button>
          </div>
        )}

        <section className="registration-card cinematic-glow-card">
          {/* Cinematic Hero Header */}
          <header className="hero-banner">
            <div className="divine-aura-glow" aria-hidden="true" />
            <div className="hero-ornament">
              <span>✦</span> सेवा • श्रद्धा • आस्था • समर्पण <span>✦</span>
            </div>

            <div className="logo-halo-container">
              <img
                className="registration-logo"
                src="/registration-logo.png"
                alt="श्री माँ नर्मदा भक्त परिवार"
              />
            </div>

            <div className="hero-sacred-motto">
              <span className="motto-glow">त्वदीय पाद पंकजं नमामि देवि नर्मदे</span>
            </div>

            <div className="hero-note-strip">
              <span>श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा • अधिकृत यात्री पंजीयन पोर्टल</span>
            </div>
          </header>

          {/* Real-time Dynamic Chunri Live Preview with Flight-Style Seat Map Trigger */}
          <div className="live-slot-preview-banner">
            <div className="preview-label">
              <Ruler size={15} />
              <span>
                {values.isVolunteer
                  ? 'स्वयंसेवक आवेदन स्थिति:'
                  : customSelectedSlot
                  ? 'आपकी चुनी हुई सीट:'
                  : 'रीयल-टाइम सीट अनुमान:'}
              </span>
            </div>
            <div className="preview-slot-box">
              {values.isVolunteer ? (
                <span className="preview-slot-num pending">⏳ व्यवस्थापक स्वीकृति उपरांत स्लॉट मिलेगा</span>
              ) : (
                <>
                  <span className="preview-slot-num">स्लॉट #{activeSelectedSlot}</span>
                  <span className="preview-slot-side">
                    ({activeAllocation.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'} से {activeAllocation.distanceFeet} फीट)
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              className="preview-seatmap-trigger-btn"
              onClick={() => {
                holyAudio.playRipple();
                setIsSeatMapModalOpen(true);
              }}
              title="हवाई जहाज सीट बुकिंग की तरह अपना स्थान चुनें"
            >
              <span>✈️ सीट मैप खोलें</span>
            </button>
          </div>

          {/* ✈️ 255M Chunri Modern Flight-Style Interactive Seat Booking System */}
          <div className="seat-selection-form-section">
            <div className="seat-section-header">
              <div className="seat-header-text">
                <span className="seat-badge-flight">✈️ लाइव सीट बुकिंग सिस्टम</span>
                <h4>255M चुनरी के दोनों छोर पर अपनी सीट चुनें</h4>
                <p>
                  लाल (🔴) स्थान भरे हुए हैं, पीला (🟡) स्थान खाली हैं। किसी भी पीले स्थान पर क्लिक कर अपना स्थान आरक्षित करें:
                </p>
              </div>
              <button
                type="button"
                className="seat-expand-modal-btn"
                onClick={() => {
                  holyAudio.playRipple();
                  setIsSeatMapModalOpen(true);
                }}
                title="बड़ी स्क्रीन में सीट मैप देखें"
              >
                <Maximize2 size={14} /> बड़ा मैप देखें
              </button>
            </div>

            <ChunriSeatBookingMap
              records={records}
              selectedSlotNumber={activeSelectedSlot}
              designatedZoneId={applicantZone.id}
              applicantLabel={`${values.name || 'यात्री'} (${applicantZone.shortName})`}
              onSelectSlot={(slot) => {
                setCustomSelectedSlot(slot);
              }}
            />
          </div>

          <form className="form-wrap" onSubmit={handleSubmit} noValidate>
            <div className="form-header-badge">
              <div className="badge-icon-wrap">
                <FileText size={20} />
              </div>
              <div className="badge-text-wrap">
                <h2 className="section-heading">यात्री पंजीयन प्रपत्र (Registration Form)</h2>
                <p className="section-subtitle">255 मीटर की चुनरी पकड़ने हेतु कृपया नीचे आवश्यक जानकारी भरें</p>
              </div>
            </div>

            {/* Glowing Gemini Pro AI Smart Auto-Fill Action */}
            <div className="ai-smart-fill-banner">
              <button
                type="button"
                className="ai-smart-fill-btn"
                onClick={() => {
                  holyAudio.playRipple();
                  setIsAutoFillOpen(true);
                }}
              >
                <div className="ai-btn-left">
                  <span className="ai-sparkle-pill">
                    <Sparkles size={14} /> Gemini Pro AI
                  </span>
                  <span className="ai-btn-title">बोलकर या 1 वाक्य लिखकर स्वतः फॉर्म भरें</span>
                </div>
                <span className="ai-btn-action">
                  क्लिक करें <ChevronRight size={16} />
                </span>
              </button>
            </div>

            {/* Chapter 1: Personal Details */}
            <div className="form-section-card">
              <div className="section-card-header">
                <span className="chapter-badge">१</span>
                <span className="chapter-title">मुख्य यात्री विवरण (Personal Details)</span>
              </div>

              <div className="field-grid">
                <Field label="Full Name" hindi="पूरा नाम" required icon={<UserRound size={17} />} error={errors.name}>
                  <input
                    className="control"
                    value={values.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="उदा. दीपक कुमार"
                    data-testid="input-name"
                  />
                </Field>

                <Field label="Father's Name" hindi="पिता का नाम" required icon={<UsersRound size={17} />} error={errors.fatherName}>
                  <input
                    className="control"
                    value={values.fatherName}
                    onChange={(e) => update('fatherName', e.target.value)}
                    placeholder="पिता का नाम लिखें"
                    data-testid="input-father-name"
                  />
                </Field>

                <Field label="Mother's Name" hindi="माता का नाम" required icon={<UserRoundPlus size={17} />} error={errors.motherName}>
                  <input
                    className="control"
                    value={values.motherName}
                    onChange={(e) => update('motherName', e.target.value)}
                    placeholder="माता का नाम लिखें"
                    data-testid="input-mother-name"
                  />
                </Field>

                <Field label="Age" hindi="आयु (वर्ष में)" required icon={<CalendarDays size={17} />} error={errors.age}>
                  <input
                    className="control"
                    type="number"
                    min="1"
                    max="120"
                    value={values.age}
                    onChange={(e) => update('age', e.target.value)}
                    placeholder="उदा. 28"
                    data-testid="input-age"
                  />
                </Field>

                <Field label="Gender" hindi="लिंग" required icon={<Accessibility size={17} />} error={errors.gender} full>
                  <div className="gender-row">
                    <label
                      className={`gender-option${values.gender === 'male' ? ' selected male' : ''}`}
                      onClick={() => holyAudio.playRipple()}
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={values.gender === 'male'}
                        onChange={() => update('gender', 'male')}
                        data-testid="radio-gender-male"
                      />
                      <PersonStanding size={18} /> पुरुष (Male)
                    </label>
                    <label
                      className={`gender-option${values.gender === 'female' ? ' selected female' : ''}`}
                      onClick={() => holyAudio.playRipple()}
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={values.gender === 'female'}
                        onChange={() => update('gender', 'female')}
                        data-testid="radio-gender-female"
                      />
                      <PersonStanding size={18} /> महिला (Female)
                    </label>
                  </div>
                </Field>

                {/* Volunteer Option (Zone 2: 50-100m) */}
                <div className="volunteer-toggle-box">
                  <label className="volunteer-checkbox-label" onClick={() => holyAudio.playRipple()}>
                    <input
                      type="checkbox"
                      checked={Boolean(values.isVolunteer)}
                      onChange={(e) => update('isVolunteer', e.target.checked)}
                      className="volunteer-checkbox-input"
                    />
                    <div className="volunteer-text-wrap">
                      <span className="volunteer-title">🛡️ क्या आप व्यवस्थापक / स्वयंसेवक (Volunteer) दल में सेवा देना चाहते हैं?</span>
                      <small className="volunteer-hint">चयन करने पर चुनरी के मध्य सुरक्षा खंड (जोन २: 50-100 मीटर) में स्वतः स्थान आवंटित होगा।</small>
                    </div>
                  </label>
                </div>

                {/* 🌟 Dynamic Real-time Zone & Slot Allocation Card based on Age & Gender */}
                <div
                  className="zone-realtime-allocation-card"
                  style={{
                    background: applicantZone.bgRgba,
                    borderColor: applicantZone.borderRgba,
                  }}
                >
                  <div className="zone-card-top">
                    <span className="zone-live-badge">
                      <Sparkles size={13} /> आपकी आयु व लिंग अनुसार स्वतः आवंटित ज़ोन:
                    </span>
                    <span className="zone-meter-badge">{applicantZone.meterRange}</span>
                  </div>

                  <div className="zone-card-main">
                    <div className="zone-badge-huge">
                      <span className="zone-icon-huge">{applicantZone.badgeIcon}</span>
                      <div>
                        <h4 className="zone-name-title">{applicantZone.name}</h4>
                        <p className="zone-target-copy">पात्रता: <b>{applicantZone.targetCategory}</b></p>
                      </div>
                    </div>

                    <div className="zone-slot-preview-box">
                      <span className="slot-preview-caption">स्लॉट स्थिति</span>
                      {values.isVolunteer ? (
                        <>
                          <strong className="slot-preview-num pending-pill">⏳ सत्यापन प्रतीक्षारत</strong>
                          <span className="slot-preview-side">व्यवस्थापक स्वीकृति उपरांत ज़ोन २ में स्लॉट मिलेगा</span>
                        </>
                      ) : (
                        <>
                          <strong className="slot-preview-num">स्लॉट #{activeSelectedSlot}</strong>
                          <span className="slot-preview-side">
                            {activeAllocation.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'} ({activeAllocation.distanceFeet} ft / {activeAllocation.distanceMeters}m)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="zone-rule-footnote">
                    ℹ️ {applicantZone.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter 2: Contact & WhatsApp */}
            <div className="form-section-card">
              <div className="section-card-header">
                <span className="chapter-badge">२</span>
                <span className="chapter-title">संपर्क सूत्र (Mobile & WhatsApp)</span>
              </div>

              <div className="field-grid">
                <Field label="Mobile Number" hindi="मोबाइल नंबर" required icon={<Phone size={17} />} error={errors.mobile}>
                  <div className="mobile-with-check">
                    <div className="control-wrap has-prefix">
                      <span className="country-code">+91</span>
                      <input
                        className="control"
                        inputMode="numeric"
                        value={values.mobile}
                        onChange={(e) => handleMobile(e.target.value)}
                        placeholder="10 अंकों का नंबर"
                        data-testid="input-mobile"
                      />
                    </div>
                    <label className={`whatsapp-same${sameWhatsapp ? ' checked' : ''}`} onClick={() => holyAudio.playRipple()}>
                      <input
                        type="checkbox"
                        checked={sameWhatsapp}
                        onChange={(e) => {
                          setSameWhatsapp(e.target.checked);
                          if (e.target.checked) update('whatsapp', values.mobile);
                        }}
                        data-testid="checkbox-same-whatsapp"
                      />
                      <span>व्हाट्सऐप समान?</span>
                    </label>
                  </div>
                </Field>

                <Field label="WhatsApp Number" hindi="व्हाट्सऐप नंबर" required icon={<MessageCircle size={17} />} error={errors.whatsapp}>
                  <div className="control-wrap has-prefix">
                    <span className="country-code">+91</span>
                    <input
                      className="control"
                      inputMode="numeric"
                      value={values.whatsapp}
                      onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="व्हाट्सऐप नंबर लिखें"
                      disabled={sameWhatsapp}
                      data-testid="input-whatsapp"
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Chapter 3: Residence Location */}
            <div className="form-section-card">
              <div className="section-card-header">
                <span className="chapter-badge">३</span>
                <span className="chapter-title">निवास स्थान (Location & Address)</span>
              </div>

              <div className="field-grid">
                <Field label="Village / Town" hindi="गाँव / नगर" required icon={<Home size={17} />} error={errors.village}>
                  <input
                    className="control"
                    value={values.village}
                    onChange={(e) => update('village', e.target.value)}
                    placeholder="गाँव या नगर का नाम"
                    data-testid="input-village"
                  />
                </Field>

                <Field label="Block / Tehsil" hindi="ब्लॉक / तहसील" required icon={<Home size={17} />} error={errors.block}>
                  <input
                    className="control"
                    value={values.block}
                    onChange={(e) => update('block', e.target.value)}
                    placeholder="ब्लॉक या तहसील लिखें"
                    data-testid="input-block"
                  />
                </Field>

                <Field label="District" hindi="जिला" required icon={<MapPin size={17} />} error={errors.district}>
                  <input
                    className="control"
                    value={values.district}
                    onChange={(e) => update('district', e.target.value)}
                    placeholder="उदा. जबलपुर, नरसिंहपुर, होशंगाबाद"
                    data-testid="input-district"
                  />
                </Field>

                <Field label="Any Disease / Allergy" hindi="स्वास्थ्य संबंधी जानकारी" icon={<HeartPulse size={17} />}>
                  <input
                    className="control"
                    value={values.allergy}
                    onChange={(e) => update('allergy', e.target.value)}
                    placeholder="यदि कोई बीमारी / एलर्जी हो तो लिखें (वैकल्पिक)"
                    data-testid="input-allergy"
                  />
                </Field>
              </div>
            </div>

            {/* Chapter 4: Companions */}
            <section className="companion-panel" aria-label="Companion details">
              <div className="companion-header-row">
                <div>
                  <h3 className="section-heading companion-heading">
                    <UsersRound size={20} /> क्या आपके साथ और भी साथी आ रहे हैं?
                  </h3>
                  <p className="section-subtitle companion-subtitle">
                    परिवार के सदस्य या मित्र जो आपके साथ चुनरी यात्रा में सम्मिलित होंगे
                  </p>
                </div>
                <button
                  className="add-companion-btn"
                  type="button"
                  onClick={addCompanion}
                  data-testid="button-add-companion"
                >
                  <Plus size={15} /> साथी जोड़ें
                </button>
              </div>

              {companions.length === 0 ? (
                <div className="companion-empty-hint">
                  <p>अभी कोई सह-यात्री नहीं जोड़ा गया है। यदि कोई साथ आ रहा है तो ऊपर <b>'साथी जोड़ें'</b> पर क्लिक करें।</p>
                </div>
              ) : (
                <div className="companions-list">
                  {companions.map((companion, index) => (
                    <div className="companion-card" key={companion.id}>
                      <div className="companion-card-badge">साथी #{index + 1}</div>
                      <div className="companion-grid">
                        <Field label="Name" hindi="नाम">
                          <input
                            className="control"
                            value={companion.name}
                            onChange={(e) => updateCompanion(companion.id, 'name', e.target.value)}
                            placeholder="साथी का नाम"
                            data-testid={`input-companion-name-${index}`}
                          />
                        </Field>

                        <Field label="Age" hindi="आयु">
                          <input
                            className="control"
                            type="number"
                            value={companion.age}
                            onChange={(e) => updateCompanion(companion.id, 'age', e.target.value)}
                            placeholder="आयु"
                            data-testid={`input-companion-age-${index}`}
                          />
                        </Field>

                        <Field label="Gender" hindi="लिंग">
                          <select
                            className="select-control"
                            value={companion.gender}
                            onChange={(e) => updateCompanion(companion.id, 'gender', e.target.value as Gender)}
                            data-testid={`select-companion-gender-${index}`}
                          >
                            <option value="">चुनें</option>
                            <option value="male">पुरुष (Male)</option>
                            <option value="female">महिला (Female)</option>
                          </select>
                        </Field>

                        <Field label="Relation" hindi="संबंध">
                          <select
                            className="select-control"
                            value={companion.relation}
                            onChange={(e) => updateCompanion(companion.id, 'relation', e.target.value)}
                            data-testid={`select-companion-relation-${index}`}
                          >
                            <option value="">संबंध चुनें</option>
                            {relations.map((relation) => (
                              <option key={relation} value={relation}>
                                {relation}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <div className="companion-remove-wrap">
                          <button
                            className="remove-companion"
                            type="button"
                            onClick={() => {
                              holyAudio.playRipple();
                              setCompanions((current) => current.filter((item) => item.id !== companion.id));
                            }}
                            aria-label={`Remove companion ${index + 1}`}
                            data-testid={`button-remove-companion-${index}`}
                            title="हटाएं"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {capacityError && (
              <p className="capacity-error">
                <Ruler size={16} /> {capacityError}
              </p>
            )}

            {/* Glowing Golden Action Button */}
            <div className="submit-action-container">
              <button
                className="submit-button cinematic-submit"
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-registration"
              >
                <span className="submit-btn-glow" aria-hidden="true" />
                {isSubmitting ? (
                  <RefreshCw size={18} className="spin-icon" />
                ) : editingId ? (
                  <Pencil size={18} />
                ) : (
                  <Send size={18} />
                )}
                <span className="submit-btn-text">
                  {isSubmitting
                    ? 'पंजीयन सर्वर पर दर्ज हो रहा है...'
                    : editingId
                    ? 'पंजीयन विवरण अपडेट करें (Update)'
                    : 'पंजीयन संपन्न करें (Submit Registration)'}
                </span>
                <Sparkles size={18} className="btn-sparkle" />
              </button>
            </div>

            <p className="form-footnote">
              <strong>🚩 माँ नर्मदा का पावन आशीर्वाद, आपके एवं आपके परिवार के साथ सदैव रहे 🚩</strong>
            </p>
          </form>
        </section>
      </div>

      {/* Floating Divine Narmada AI Assistant FAB */}
      <button
        type="button"
        className="floating-ai-fab"
        onClick={() => {
          holyAudio.playRipple();
          setIsChatOpen(true);
        }}
        title="नर्मदा एआई मार्गदर्शक से प्रश्न पूछें"
      >
        <span className="fab-glow-ring" />
        <span className="fab-icon">🌸</span>
        <span className="fab-text">नर्मदा एआई</span>
        <span className="fab-sparkle">✨</span>
      </button>

      {/* Modals */}
      <AiAutoFillModal
        isOpen={isAutoFillOpen}
        onClose={() => setIsAutoFillOpen(false)}
        onApply={handleAiAutoFillApply}
      />

      <NarmadaAiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <GeminiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <QrPassModal
        isOpen={isQrPassOpen}
        onClose={() => setIsQrPassOpen(false)}
        record={qrPassRecord}
        allRecords={records}
        onSelectRecord={(rec) => setQrPassRecord(rec)}
        onNewRegistration={() => {
          setIsQrPassOpen(false);
          resetForm();
          setView('form');
        }}
      />

      {/* Flight Style Chunri Seat Map Modal */}
      {isSeatMapModalOpen && (
        <div className="seatmap-modal-backdrop" onClick={() => setIsSeatMapModalOpen(false)}>
          <div className="seatmap-modal-container" onClick={(e) => e.stopPropagation()}>
            <ChunriSeatBookingMap
              records={records}
              selectedSlotNumber={activeSelectedSlot}
              designatedZoneId={applicantZone.id}
              applicantLabel={`${values.name || 'यात्री'} (${applicantZone.shortName})`}
              onSelectSlot={(slot) => {
                setCustomSelectedSlot(slot);
              }}
              isModal={true}
              onCloseModal={() => setIsSeatMapModalOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
