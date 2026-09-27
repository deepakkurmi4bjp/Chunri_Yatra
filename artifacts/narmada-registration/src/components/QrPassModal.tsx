import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCheck,
  MapPin,
  Phone,
  Printer,
  QrCode,
  Ruler,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { holyAudio } from '../lib/sound';
import type { Allocation, Companion, FormValues, RegistrationRecord } from '../lib/registrationsApi';

export type QrPassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  record?: RegistrationRecord | null;
  allRecords: RegistrationRecord[];
  onSelectRecord?: (record: RegistrationRecord) => void;
  onNewRegistration?: () => void;
};

export function QrPassModal({
  isOpen,
  onClose,
  record: initialRecord,
  allRecords,
  onSelectRecord,
  onNewRegistration,
}: QrPassModalProps) {
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(initialRecord || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const passCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setSelectedRecord(initialRecord);
    } else if (allRecords.length > 0 && !selectedRecord) {
      setSelectedRecord(allRecords[0]);
    }
  }, [initialRecord, allRecords]);

  // Generate QR Code when selected record changes
  useEffect(() => {
    if (!selectedRecord) {
      setQrDataUrl('');
      return;
    }

    const isPending = selectedRecord.allocation?.isPendingApproval;
    const payload = JSON.stringify({
      event: 'Maa Narmada Chunri Yatra 2026',
      id: selectedRecord.id,
      name: selectedRecord.values.name,
      mobile: selectedRecord.values.mobile,
      slot: isPending ? 'PENDING_APPROVAL' : selectedRecord.allocation?.slotNumber,
      zone: selectedRecord.allocation?.zoneName || 'Zone 2',
      volunteerStatus: selectedRecord.volunteerStatus || 'none',
      status: isPending ? 'PENDING_VERIFICATION' : selectedRecord.status,
      timestamp: selectedRecord.createdAt,
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1e3a1e', // Deep sacred emerald green
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation failed:', err));
  }, [selectedRecord]);

  if (!isOpen) return null;

  // Filter matching records if searching
  const matchingRecords = searchQuery.trim()
    ? allRecords.filter((r) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          r.values.name.toLowerCase().includes(q) ||
          r.values.mobile.includes(q) ||
          r.values.village.toLowerCase().includes(q) ||
          r.values.district.toLowerCase().includes(q) ||
          String(r.allocation?.slotNumber).includes(q)
        );
      })
    : allRecords;

  const handleDownload = () => {
    holyAudio.playRipple();
    setIsDownloading(true);

    if (!selectedRecord || !qrDataUrl) {
      setIsDownloading(false);
      return;
    }

    // High quality canvas rendering for instant reliable download
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // Sacred Background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 1100);
    bgGrad.addColorStop(0, '#0a1d12');
    bgGrad.addColorStop(0.5, '#07150d');
    bgGrad.addColorStop(1, '#040b07');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1100);

    // Golden Border
    ctx.strokeStyle = '#f5c431';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 1060);

    ctx.strokeStyle = 'rgba(245, 196, 49, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 744, 1044);

    // Header Mantra
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffdf7a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('।। श्री नर्मदे हर ।।', 400, 70);

    ctx.fillStyle = '#f5c431';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा 2026', 400, 115);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '16px sans-serif';
    ctx.fillText('255 मीटर विशाल चुनरी सेवा • अधिकृत डिजिटल प्रवेश पास', 400, 145);

    // Divider
    ctx.strokeStyle = 'rgba(245, 196, 49, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 165);
    ctx.lineTo(740, 165);
    ctx.stroke();

    // Devotee Name Box
    ctx.fillStyle = 'rgba(245, 196, 49, 0.12)';
    ctx.fillRect(60, 185, 680, 85);
    ctx.strokeStyle = 'rgba(245, 196, 49, 0.4)';
    ctx.strokeRect(60, 185, 680, 85);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fef08a';
    ctx.font = '16px sans-serif';
    ctx.fillText('मुख्य भक्त / यात्री का नाम:', 80, 215);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(selectedRecord.values.name, 80, 252);

    // Slot & Location Section
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(60, 290, 680, 110);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(60, 290, 680, 110);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('चुनरी सेवा स्थान (CHUNRI SLOT)', 400, 325);

    if (selectedRecord.allocation?.isPendingApproval) {
      ctx.fillStyle = '#f5c431';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('⏳ स्वयंसेवक सत्यापन प्रतीक्षारत', 400, 362);
      ctx.fillStyle = '#fef08a';
      ctx.font = '15px sans-serif';
      ctx.fillText('(व्यवस्थापक द्वारा स्वीकृति उपरांत ज़ोन २ में स्लॉट आवंटित होगा)', 400, 388);
    } else {
      ctx.fillStyle = '#f5c431';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(`स्लॉट #${selectedRecord.allocation.slotNumber}`, 400, 375);
    }

    // Details Grid
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '18px sans-serif';

    if (selectedRecord.allocation?.isPendingApproval) {
      ctx.fillText('दिशा / छोर: व्यवस्थापक सत्यापन उपरांत', 80, 435);
      ctx.fillText('स्थान दूरी: व्यवस्थापक सत्यापन उपरांत', 420, 435);
    } else {
      ctx.fillText(`दिशा / छोर: ${selectedRecord.allocation?.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'}`, 80, 435);
      ctx.fillText(`स्थान दूरी: ${selectedRecord.allocation?.distanceFeet} फीट (${selectedRecord.allocation?.distanceMeters} मीटर)`, 420, 435);
    }

    ctx.fillText(`पिता का नाम: ${selectedRecord.values.fatherName}`, 80, 470);
    ctx.fillText(`मोबाइल: ${selectedRecord.values.mobile}`, 420, 470);

    ctx.fillText(`गाँव/शहर: ${selectedRecord.values.village}`, 80, 505);
    ctx.fillText(`जिला: ${selectedRecord.values.district}`, 420, 505);

    ctx.fillText(`सह-यात्री: ${selectedRecord.companions.length > 0 ? `${selectedRecord.companions.length} परिजन` : 'अकेले'}`, 80, 540);
    ctx.fillText(`स्थिति: ${selectedRecord.status === 'checked' ? '✓ सत्यापित (Checked)' : 'पंजीकृत (New)'}`, 420, 540);

    // QR Code Image
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      // White QR Container Card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(260, 580, 280, 280);
      ctx.drawImage(qrImg, 260, 580, 280, 280);

      // QR label
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('सुरक्षा एवं सेवा सत्यापन हेतु यह QR कोड स्कैन करें', 400, 890);

      // Sacred Mantra Footer
      ctx.fillStyle = 'rgba(245, 196, 49, 0.15)';
      ctx.fillRect(60, 930, 680, 70);
      ctx.strokeStyle = 'rgba(245, 196, 49, 0.4)';
      ctx.strokeRect(60, 930, 680, 70);

      ctx.fillStyle = '#f5c431';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('।। त्वदीय पाद पंकजं नमामि देवि नर्मदे ।।', 400, 972);

      // Download Trigger
      const link = document.createElement('a');
      const safeSlot = selectedRecord.allocation?.isPendingApproval ? 'Pending' : (selectedRecord.allocation?.slotNumber || 'Pass');
      link.download = `Narmada_Yatra_QR_Pass_${selectedRecord.values.name}_Slot_${safeSlot}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsDownloading(false);
    };
    qrImg.src = qrDataUrl;
  };

  const handlePrint = () => {
    holyAudio.playRipple();
    window.print();
  };

  const handleCopyDetails = () => {
    if (!selectedRecord) return;
    holyAudio.playRipple();
    const isPending = selectedRecord.allocation?.isPendingApproval;
    const slotStr = isPending
      ? '⏳ स्वयंसेवक आवेदन: सत्यापन प्रतीक्षारत (स्वीकृति उपरांत ज़ोन २ में स्लॉट आवंटित होगा)'
      : `🚩 स्लॉट: #${selectedRecord.allocation?.slotNumber} (${selectedRecord.allocation?.side === 'left' ? 'बायाँ' : 'दायाँ'} छोर, ${selectedRecord.allocation?.distanceFeet} ft • ${selectedRecord.allocation?.zoneName || 'जोन'})`;

    const text =
      `🚩 श्री माँ नर्मदा चुनरी यात्रा 2026 - डिजिटल QR पास\n` +
      `👤 भक्त: ${selectedRecord.values.name}\n` +
      `${slotStr}\n` +
      `📞 मोबाइल: ${selectedRecord.values.mobile}\n` +
      `📍 स्थान: ${selectedRecord.values.village}, ${selectedRecord.values.district}\n` +
      `।। नर्मदे हर ।।`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!selectedRecord) return;
    holyAudio.playRipple();
    const isPending = selectedRecord.allocation?.isPendingApproval;
    const slotText = isPending
      ? `🛡️ *स्वयंसेवक स्थिति:* व्यवस्थापक सत्यापन प्रतीक्षारत (स्वीकृति उपरांत ज़ोन २: 50-100m में स्लॉट मिलेगा)\n`
      : `🚩 *चुनरी स्लॉट:* #${selectedRecord.allocation?.slotNumber} (${selectedRecord.allocation?.zoneName || ''})\n` +
        `📏 *दूरी:* ${selectedRecord.allocation?.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'} से ${selectedRecord.allocation?.distanceFeet} फीट (${selectedRecord.allocation?.distanceMeters} मीटर)\n`;

    const text = encodeURIComponent(
      `🚩 *।। नर्मदे हर ।।* 🚩\n\n` +
      `*श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा 2026*\n` +
      `🎫 *अधिकृत डिजिटल QR पास*\n\n` +
      `👤 *भक्त:* ${selectedRecord.values.name}\n` +
      `${slotText}` +
      `📞 *मोबाइल:* ${selectedRecord.values.mobile}\n` +
      `📍 *पता:* ${selectedRecord.values.village}, ${selectedRecord.values.district}\n` +
      `👥 *सह-यात्री:* ${selectedRecord.companions.length > 0 ? `+${selectedRecord.companions.length} परिजन` : 'अकेले'}\n\n` +
      `✨ *255 मीटर विशाल चुनरी सेवा हेतु अधिकृत प्रवेश पास*\n` +
      `माँ नर्मदा का पावन आशीर्वाद आप पर सदैव बना रहे! 🙏`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="qr-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="qr-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-title-row">
            <span className="qr-icon-emblem">
              <QrCode size={22} />
            </span>
            <div>
              <h3>डिजिटल QR पास जनरेटर</h3>
              <p>श्री माँ नर्मदा चुनरी यात्रा 2026 • आधिकारिक प्रवेश एवं सत्यापन पास</p>
            </div>
          </div>
          <button
            type="button"
            className="qr-modal-close-btn"
            onClick={onClose}
            aria-label="Close QR Modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="qr-modal-body">
          {/* Devotee Search / Selector Bar */}
          <div className="qr-search-bar">
            <Search size={16} className="qr-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, 10-अंकों का मोबाइल या स्लॉट नंबर से खोजें..."
              className="qr-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="qr-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick devotee pills if searching or multiple records */}
          {searchQuery && (
            <div className="qr-search-results">
              {matchingRecords.length === 0 ? (
                <div className="qr-search-empty">
                  <span>कोई मेल खाता भक्त नहीं मिला।</span>
                  {onNewRegistration && (
                    <button
                      type="button"
                      className="qr-quick-register-btn"
                      onClick={() => {
                        onClose();
                        onNewRegistration();
                      }}
                    >
                      + नया पंजीयन फॉर्म भरें
                    </button>
                  )}
                </div>
              ) : (
                <div className="qr-pills-list">
                  {matchingRecords.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`qr-devotee-pill ${selectedRecord?.id === r.id ? 'active' : ''}`}
                      onClick={() => {
                        holyAudio.playRipple();
                        setSelectedRecord(r);
                        if (onSelectRecord) onSelectRecord(r);
                      }}
                    >
                      <span className={`pill-slot ${r.allocation?.isPendingApproval ? 'pending' : ''}`}>
                        {r.allocation?.isPendingApproval ? '⏳ लंबित' : `#${r.allocation?.slotNumber}`}
                      </span>
                      <span className="pill-name">{r.values.name}</span>
                      <span className="pill-phone">({r.values.mobile})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main QR Pass Ticket Display */}
          {selectedRecord ? (
            <div className="qr-pass-wrapper" ref={passCardRef}>
              <div className="qr-pass-ticket">
                {/* Decorative Holy Emblem Watermark */}
                <div className="ticket-watermark">नर्मदे हर</div>

                <div className="ticket-top-banner">
                  <div className="banner-left">
                    <span className="holy-flag">🚩</span>
                    <div>
                      <span className="banner-super">श्री माँ नर्मदा जन्मोत्सव 2026</span>
                      <h4 className="banner-main">255M चुनरी यात्रा संकल्प पत्र</h4>
                    </div>
                  </div>
                  <span className="ticket-vip-tag">
                    <ShieldCheck size={13} /> OFFICIAL QR PASS
                  </span>
                </div>

                <div className="ticket-content-grid">
                  {/* Left Column: Details */}
                  <div className="ticket-details-col">
                    <div className="ticket-field-block">
                      <span className="field-lbl">मुख्य भक्त / Yatri Name</span>
                      <strong className="field-val-big">{selectedRecord.values.name}</strong>
                    </div>

                    <div className="ticket-two-col">
                      <div>
                        <span className="field-lbl">पिता/पति का नाम</span>
                        <strong className="field-val">{selectedRecord.values.fatherName}</strong>
                      </div>
                      <div>
                        <span className="field-lbl">आयु / Age</span>
                        <strong className="field-val">{selectedRecord.values.age} वर्ष</strong>
                      </div>
                    </div>

                    <div className="ticket-two-col">
                      <div>
                        <span className="field-lbl">मोबाइल नंबर</span>
                        <strong className="field-val">📞 {selectedRecord.values.mobile}</strong>
                      </div>
                      <div>
                        <span className="field-lbl">गाँव / जिला</span>
                        <strong className="field-val">📍 {selectedRecord.values.village}, {selectedRecord.values.district}</strong>
                      </div>
                    </div>

                    {selectedRecord.companions && selectedRecord.companions.length > 0 && (
                      <div className="ticket-companions-tag">
                        <UsersRound size={13} />
                        <span>साथी: <b>+{selectedRecord.companions.length} सह-यात्री</b></span>
                        <small>({selectedRecord.companions.map((c) => c.name).filter(Boolean).join(', ')})</small>
                      </div>
                    )}

                    {/* Slot Highlight Box */}
                    <div className="ticket-slot-box">
                      <div className="slot-badge-head">
                        <Ruler size={13} />
                        <span>आवंटित चुनरी स्थान</span>
                        {selectedRecord.allocation?.zoneName && (
                          <span className="ticket-zone-pill">{selectedRecord.allocation.zoneName}</span>
                        )}
                      </div>
                      <div className="slot-badge-numbers">
                        {selectedRecord.allocation?.isPendingApproval ? (
                          <div className="ticket-pending-volunteer-box">
                            <span className="slot-huge pending-text">⏳ स्वयंसेवक सत्यापन प्रतीक्षारत</span>
                            <span className="slot-sub">
                              व्यवस्थापक द्वारा स्वीकृति उपरांत ज़ोन २ (50-100 मीटर) में स्लॉट नंबर दिया जाएगा।
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="slot-huge">स्लॉट #{selectedRecord.allocation?.slotNumber}</span>
                            <span className="slot-sub">
                              {selectedRecord.allocation?.side === 'left' ? 'बायाँ छोर (Left End)' : 'दायाँ छोर (Right End)'} से{' '}
                              <b>{selectedRecord.allocation?.distanceFeet} ft</b> ({selectedRecord.allocation?.distanceMeters}m)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: High Quality QR Code */}
                  <div className="ticket-qr-col">
                    <div className="qr-frame-card">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="चुनरी यात्रा डिजिटल QR पास"
                          className="qr-image"
                        />
                      ) : (
                        <div className="qr-loading">
                          <QrCode size={40} className="spin-icon" />
                          <span>QR कोड तैयार हो रहा है...</span>
                        </div>
                      )}
                      <div className="qr-scan-hint">
                        <ScanCheckIcon /> <span>सत्यापन हेतु स्कैन करें</span>
                      </div>
                    </div>

                    <div className="ticket-security-pill">
                      <FileCheck size={12} />
                      <span>आईडी: {selectedRecord.id.slice(0, 10).toUpperCase()}</span>
                    </div>

                    <button
                      type="button"
                      className="qr-verify-toggle-btn"
                      onClick={() => {
                        holyAudio.playRipple();
                        setIsVerifying(!isVerifying);
                      }}
                    >
                      <Eye size={12} /> {isVerifying ? 'सत्यापन विवरण छुपाएं' : 'QR डेटा देखें'}
                    </button>
                  </div>
                </div>

                {/* Optional QR Data Inspector */}
                {isVerifying && (
                  <div className="qr-inspection-box">
                    <div className="inspection-title">
                      <CheckCircle2 size={14} className="text-green" /> QR डेटा सत्यापन स्ट्रिंग:
                    </div>
                    <pre className="inspection-pre">
                      {JSON.stringify(
                        {
                          event: 'Maa Narmada Chunri Yatra 2026',
                          id: selectedRecord.id,
                          devotee: selectedRecord.values.name,
                          slot: selectedRecord.allocation?.slotNumber,
                          side: selectedRecord.allocation?.side,
                          distance: `${selectedRecord.allocation?.distanceFeet}ft`,
                          mobile: selectedRecord.values.mobile,
                          status: 'VERIFIED',
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                {/* Holy Footer Mantra */}
                <div className="ticket-sacred-footer">
                  <span>।। त्वदीय पाद पंकजं नमामि देवि नर्मदे ।।</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="qr-no-records">
              <QrCode size={48} className="qr-empty-icon" />
              <h4>कोई पंजीयन चयनित नहीं है</h4>
              <p>कृपया ऊपर सर्च बॉक्स में अपना नाम या मोबाइल नंबर लिखकर खोजें।</p>
              {onNewRegistration && (
                <button
                  type="button"
                  className="qr-primary-btn"
                  onClick={() => {
                    onClose();
                    onNewRegistration();
                  }}
                >
                  नया पंजीयन फॉर्म भरें
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        {selectedRecord && (
          <div className="qr-modal-footer">
            <button
              type="button"
              className="qr-action-btn download-btn"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={15} />
              <span>{isDownloading ? 'तैयार हो रहा है...' : 'डाउनलोड QR पास (PNG)'}</span>
            </button>

            <button
              type="button"
              className="qr-action-btn print-btn"
              onClick={handlePrint}
            >
              <Printer size={15} />
              <span>प्रिंट करें</span>
            </button>

            <button
              type="button"
              className="qr-action-btn whatsapp-btn"
              onClick={handleShareWhatsApp}
            >
              <Share2 size={15} />
              <span>WhatsApp पर भेजें</span>
            </button>

            <button
              type="button"
              className="qr-action-btn copy-btn"
              onClick={handleCopyDetails}
            >
              {isCopied ? <Check size={15} className="text-green" /> : <Copy size={15} />}
              <span>{isCopied ? 'कॉपी हुआ!' : 'विवरण कॉपी करें'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScanCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
