import React, { useMemo, useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  Compass,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  Ruler,
  Search,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { holyAudio } from '../lib/sound';
import type { Allocation, RegistrationRecord } from '../lib/registrationsApi';
import {
  CHUNRI_ZONES,
  getZoneBySlotNumber,
  type ChunriZone,
  type ZoneId,
} from '../lib/chunriZones';

export type ChunriSeatBookingMapProps = {
  records: RegistrationRecord[];
  selectedSlotNumber: number | null;
  onSelectSlot: (slotNumber: number) => void;
  designatedZoneId?: string;
  applicantLabel?: string;
  isModal?: boolean;
  onCloseModal?: () => void;
};

const TOTAL_SLOTS = 417;
const TOTAL_ROWS = Math.ceil(TOTAL_SLOTS / 2); // 209 rows

// 4 Specific Zones matching the user specification:
// Zone 1: First 50m (Women/Girls) -> Rows 1 to 50 (Slots 1-100)
// Zone 2: Second 50m (Volunteers) -> Rows 51 to 100 (Slots 101-200)
// Zone 3: 100-205m (Men > 35) -> Rows 101 to 158 (Slots 201-316)
// Zone 4: Last 50m 205-255m (Youth/Boys <= 35) -> Rows 159 to 209 (Slots 317-417)
const MAP_ZONES = [
  { id: 'all', name: 'संपूर्ण चुनरी (0-255M)', startRow: 1, endRow: TOTAL_ROWS, badge: '🚩' },
  { id: 'zone1', name: '🌸 जोन १: महिलाएं/कन्याएं (0-50M)', startRow: 1, endRow: 50, badge: '🌸' },
  { id: 'zone2', name: '🛡️ जोन २: स्वयंसेवक/स्वयंसेविका (50-100M)', startRow: 51, endRow: 100, badge: '🛡️' },
  { id: 'zone3', name: '🚩 जोन ३: 35+ वर्ष के पुरुष (100-205M)', startRow: 101, endRow: 158, badge: '🚩' },
  { id: 'zone4', name: '⚡ जोन ४: युवा लड़के/पुरुष <=35 (205-255M)', startRow: 159, endRow: TOTAL_ROWS, badge: '⚡' },
];

export function ChunriSeatBookingMap({
  records,
  selectedSlotNumber,
  onSelectSlot,
  designatedZoneId,
  applicantLabel,
  isModal = false,
  onCloseModal,
}: ChunriSeatBookingMapProps) {
  const [activeZone, setActiveZone] = useState<string>(() => designatedZoneId || 'all');
  const [searchSlot, setSearchSlot] = useState<string>('');
  const [inspectedSlot, setInspectedSlot] = useState<{
    slotNumber: number;
    side: 'left' | 'right';
    distanceFeet: number;
    distanceMeters: number;
    zone: ChunriZone;
    record?: RegistrationRecord;
  } | null>(null);

  // Sync activeZone if designatedZoneId changes
  useEffect(() => {
    if (designatedZoneId) {
      setActiveZone(designatedZoneId);
    }
  }, [designatedZoneId]);

  // Map of occupied slots: slotNumber -> record
  const occupiedSlotsMap = useMemo(() => {
    const map = new Map<number, RegistrationRecord>();
    records.forEach((record) => {
      if (record.allocation?.slotNumber && !record.allocation.isPendingApproval) {
        map.set(record.allocation.slotNumber, record);
      }
    });
    return map;
  }, [records]);

  const bookedCount = occupiedSlotsMap.size;
  const availableCount = Math.max(0, TOTAL_SLOTS - bookedCount);

  // Filter rows based on active zone or search
  const currentZone = MAP_ZONES.find((z) => z.id === activeZone) || MAP_ZONES[0];

  const rows = useMemo(() => {
    const list: number[] = [];
    for (let r = currentZone.startRow; r <= currentZone.endRow; r++) {
      if (searchSlot) {
        const queryNum = parseInt(searchSlot, 10);
        const leftSlot = (r - 1) * 2 + 1;
        const rightSlot = r * 2;
        if (leftSlot === queryNum || rightSlot === queryNum) {
          list.push(r);
        }
      } else {
        list.push(r);
      }
    }
    return list;
  }, [currentZone, searchSlot]);

  const handleSlotClick = (slotNumber: number) => {
    if (slotNumber > TOTAL_SLOTS) return;
    holyAudio.playRipple();

    const distanceFeet = Math.ceil(slotNumber / 2) * 2;
    const distanceMeters = Number((distanceFeet * 0.3048).toFixed(2));
    const side = slotNumber % 2 === 1 ? 'left' : 'right';
    const zone = getZoneBySlotNumber(slotNumber);
    const record = occupiedSlotsMap.get(slotNumber);

    setInspectedSlot({
      slotNumber,
      side,
      distanceFeet,
      distanceMeters,
      zone,
      record,
    });

    // If available, select it!
    if (!record) {
      onSelectSlot(slotNumber);
    }
  };

  const applicantZone = designatedZoneId
    ? CHUNRI_ZONES.find((z) => z.id === designatedZoneId)
    : null;

  return (
    <div className={`chunri-seatmap-root ${isModal ? 'as-modal' : 'as-card'}`}>
      {/* Flight Style Cabin Header */}
      <div className="seatmap-header">
        <div className="seatmap-title-wrap">
          <div className="seatmap-icon-halo">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="seatmap-heading">255M चुनरी सीट बुकिंग मैप (Live Seat Selector)</h3>
            <p className="seatmap-subheading">
              हवाई जहाज सीट बुकिंग की तरह चुनरी के दोनों सिरों पर अपना स्थान चुनें
            </p>
          </div>
        </div>

        {isModal && onCloseModal && (
          <button
            type="button"
            className="seatmap-close-btn"
            onClick={onCloseModal}
            aria-label="Close Seat Map"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Flight Style Visual Legend */}
      <div className="seatmap-legend-bar">
        <div className="legend-items">
          <div className="legend-item booked">
            <span className="legend-person-preview red">
              <PersonGlyph color="#ef4444" />
            </span>
            <span className="legend-label">
              🔴 <b>भरी हुई सीट (Booked)</b>
              <small>({bookedCount})</small>
            </span>
          </div>

          <div className="legend-item available">
            <span className="legend-person-preview yellow pulse">
              <PersonGlyph color="#f5c431" />
            </span>
            <span className="legend-label">
              🟡 <b>उपलब्ध सीट (Available)</b>
              <small>({availableCount} शेष)</small>
            </span>
          </div>

          <div className="legend-item selected">
            <span className="legend-person-preview green">
              <PersonGlyph color="#10b981" />
            </span>
            <span className="legend-label">
              🟢 <b>आपकी चुनी सीट (Selected)</b>
              <small>{selectedSlotNumber ? `#${selectedSlotNumber}` : 'चुनें'}</small>
            </span>
          </div>
        </div>

        {/* Quick Slot Search */}
        <div className="seatmap-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="number"
            min="1"
            max={TOTAL_SLOTS}
            value={searchSlot}
            onChange={(e) => setSearchSlot(e.target.value)}
            placeholder="स्लॉट नंबर (1-417)..."
            className="search-input"
          />
          {searchSlot && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchSlot('')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Applicant Designated Zone Announcement Banner */}
      {applicantZone && (
        <div
          className="seatmap-applicant-zone-banner"
          style={{ background: applicantZone.bgRgba, borderColor: applicantZone.borderRgba }}
        >
          <span className="applicant-zone-badge">{applicantZone.badgeIcon} {applicantZone.shortName}</span>
          <div className="applicant-zone-text">
            <strong>
              {designatedZoneId === 'zone2'
                ? '🛡️ समर्पित स्वयंसेवक एवं व्यवस्थापक दल ज़ोन (सत्यापन आवश्यक)'
                : 'आपके विवरण (उम्र व लिंग) अनुसार आवंटित ज़ोन'}
            </strong>
            <span>
              {designatedZoneId === 'zone2'
                ? 'स्वयंसेवकों को व्यवस्थापक द्वारा सत्यापन उपरांत ज़ोन २ (स्लॉट 101-200) में स्थान आवंटित किया जाता है।'
                : `${applicantZone.meterRange} • ${applicantZone.targetCategory}`}
            </span>
          </div>
        </div>
      )}

      {/* Zone / Cabin Filter Tabs */}
      <div className="seatmap-zone-tabs">
        {MAP_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={`zone-tab ${activeZone === zone.id ? 'active' : ''}`}
            onClick={() => {
              holyAudio.playRipple();
              setActiveZone(zone.id);
              setSearchSlot('');
            }}
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Modern Airplane Fuselage / Chunri Cabin Layout */}
      <div className="seatmap-cabin-viewport">
        <div className="fuselage-shell">
          {/* Airplane Nose / Sacred River Gate */}
          <div className="fuselage-nose">
            <div className="cockpit-window">
              <span className="om-sacred-symbol">ॐ</span>
              <span className="nose-label">🚩 0 METERS • माँ नर्मदा पावन घाट (आरंभ छोर)</span>
            </div>
            <div className="nose-wings">
              <span className="wing-marker left">बायाँ छोर (Left End)</span>
              <span className="wing-marker right">दायाँ छोर (Right End)</span>
            </div>
          </div>

          {/* Cabin Rows Scrollable Grid */}
          <div className="cabin-rows-stream">
            {rows.length === 0 ? (
              <div className="no-rows-found">
                <span>स्लॉट #{searchSlot} इस ज़ोन में नहीं मिला।</span>
                <button
                  type="button"
                  className="reset-search-btn"
                  onClick={() => setSearchSlot('')}
                >
                  सभी स्लॉट देखें
                </button>
              </div>
            ) : (
              rows.map((rowNum) => {
                const leftSlotNum = (rowNum - 1) * 2 + 1;
                const rightSlotNum = rowNum * 2;
                const distFeet = rowNum * 2;
                const distMeters = (distFeet * 0.3048).toFixed(1);

                const isLeftBooked = occupiedSlotsMap.has(leftSlotNum);
                const isLeftSelected = selectedSlotNumber === leftSlotNum;
                const leftRecord = occupiedSlotsMap.get(leftSlotNum);

                const isRightValid = rightSlotNum <= TOTAL_SLOTS;
                const isRightBooked = isRightValid && occupiedSlotsMap.has(rightSlotNum);
                const isRightSelected = selectedSlotNumber === rightSlotNum;
                const rightRecord = isRightValid ? occupiedSlotsMap.get(rightSlotNum) : undefined;

                return (
                  <div className="cabin-row-unit" key={rowNum}>
                    {/* Left Seat / Person */}
                    <div
                      className={`seat-person-node left-node ${
                        isLeftSelected
                          ? 'is-selected'
                          : isLeftBooked
                          ? 'is-booked'
                          : 'is-available'
                      }`}
                      onClick={() => handleSlotClick(leftSlotNum)}
                      title={`स्लॉट #${leftSlotNum} (बायाँ छोर, ${distFeet}ft) - ${
                        isLeftBooked
                          ? `बुक: ${leftRecord?.values.name || 'पंजीकृत'}`
                          : 'उपलब्ध (क्लिक कर बुक करें)'
                      }`}
                    >
                      <div className="person-icon-wrapper">
                        <PersonGlyph
                          color={
                            isLeftSelected
                              ? '#10b981'
                              : isLeftBooked
                              ? '#ef4444'
                              : '#f5c431'
                          }
                        />
                      </div>
                      <span className="seat-slot-badge">#{leftSlotNum}</span>
                      {isLeftBooked && (
                        <span className="seat-occupant-name" title={leftRecord?.values.name}>
                          {leftRecord?.values.name.split(' ')[0] || 'भक्त'}
                        </span>
                      )}
                    </div>

                    {/* Central Holy Chunri Ribbon Aisle */}
                    <div className="cabin-aisle-chunri">
                      <div className="chunri-cloth-texture">
                        <div className="chunri-gold-zari" />
                        <span className="aisle-row-badge">
                          R{rowNum} • {distFeet}ft ({distMeters}m)
                        </span>
                        <div className="chunri-gold-zari" />
                      </div>
                    </div>

                    {/* Right Seat / Person */}
                    {isRightValid ? (
                      <div
                        className={`seat-person-node right-node ${
                          isRightSelected
                            ? 'is-selected'
                            : isRightBooked
                            ? 'is-booked'
                            : 'is-available'
                        }`}
                        onClick={() => handleSlotClick(rightSlotNum)}
                        title={`स्लॉट #${rightSlotNum} (दायाँ छोर, ${distFeet}ft) - ${
                          isRightBooked
                            ? `बुक: ${rightRecord?.values.name || 'पंजीकृत'}`
                            : 'उपलब्ध (क्लिक कर बुक करें)'
                        }`}
                      >
                        <div className="person-icon-wrapper">
                          <PersonGlyph
                            color={
                              isRightSelected
                                ? '#10b981'
                                : isRightBooked
                                ? '#ef4444'
                                : '#f5c431'
                            }
                          />
                        </div>
                        <span className="seat-slot-badge">#{rightSlotNum}</span>
                        {isRightBooked && (
                          <span className="seat-occupant-name" title={rightRecord?.values.name}>
                            {rightRecord?.values.name.split(' ')[0] || 'भक्त'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="seat-empty-placeholder" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Airplane Tail / 255M End Gate */}
          <div className="fuselage-tail">
            <div className="tail-symbol-pill">
              <span>🚩 255 METERS • संगम पूर्णाहूति छोर 🚩</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Selected Seat Confirmation Bar */}
      {selectedSlotNumber && (
        <div className="seatmap-selected-footer">
          <div className="selected-summary-left">
            <span className="selected-pulse-dot" />
            <div>
              <strong className="selected-title">
                आपकी चुनी हुई चुनरी सीट: स्लॉट #{selectedSlotNumber}
              </strong>
              <p className="selected-details">
                {selectedSlotNumber % 2 === 1 ? 'बायाँ छोर (Left End)' : 'दायाँ छोर (Right End)'} से{' '}
                {Math.ceil(selectedSlotNumber / 2) * 2} फीट (
                {(Math.ceil(selectedSlotNumber / 2) * 2 * 0.3048).toFixed(1)} मीटर)
              </p>
            </div>
          </div>

          <div className="selected-actions">
            <button
              type="button"
              className="confirm-seat-btn"
              onClick={() => {
                holyAudio.playTempleChime();
                if (isModal && onCloseModal) onCloseModal();
              }}
            >
              <Check size={16} />
              <span>यह स्थान लॉक करें</span>
            </button>
          </div>
        </div>
      )}

      {/* Seat Inspector Tooltip / Drawer */}
      {inspectedSlot && (
        <div className="seatmap-inspector-card">
          <div className="inspector-head">
            <div className="inspector-title">
              <span
                className={`inspector-status-badge ${
                  inspectedSlot.record ? 'booked' : 'available'
                }`}
              >
                {inspectedSlot.record ? '🔴 भरी हुई (Booked)' : '🟡 उपलब्ध (Available)'}
              </span>
              <h4>स्लॉट #{inspectedSlot.slotNumber} विवरण</h4>
            </div>
            <button
              type="button"
              className="inspector-close"
              onClick={() => setInspectedSlot(null)}
            >
              <X size={14} />
            </button>
          </div>

          <div className="inspector-grid">
            <div>
              <span className="insp-lbl">आवंटित जोन</span>
              <strong className="insp-val" style={{ color: inspectedSlot.zone.themeColor }}>
                {inspectedSlot.zone.badgeIcon} {inspectedSlot.zone.shortName}
              </strong>
            </div>
            <div>
              <span className="insp-lbl">पात्र वर्ग</span>
              <strong className="insp-val">{inspectedSlot.zone.targetCategory}</strong>
            </div>
            {inspectedSlot.zone.id === 'zone2' && (
              <div className="insp-zone2-notice">
                🛡️ नोट: ज़ोन २ (स्लॉट 101-200) समर्पित स्वयंसेवकों हेतु आरक्षित है। व्यवस्थापक सत्यापन के बाद ही यह स्थान आवंटित होता है।
              </div>
            )}
            <div>
              <span className="insp-lbl">दिशा / छोर</span>
              <strong className="insp-val">
                {inspectedSlot.side === 'left' ? 'बायाँ छोर (Left End)' : 'दायाँ छोर (Right End)'}
              </strong>
            </div>
            <div>
              <span className="insp-lbl">दूरी (Distance)</span>
              <strong className="insp-val">
                {inspectedSlot.distanceFeet} फीट ({inspectedSlot.distanceMeters} मीटर)
              </strong>
            </div>

            {inspectedSlot.record ? (
              <>
                <div>
                  <span className="insp-lbl">पंजीकृत भक्त का नाम</span>
                  <strong className="insp-val highlight-gold">
                    {inspectedSlot.record.values.name}
                  </strong>
                </div>
                <div>
                  <span className="insp-lbl">गाँव / जिला</span>
                  <strong className="insp-val">
                    {inspectedSlot.record.values.village}, {inspectedSlot.record.values.district}
                  </strong>
                </div>
              </>
            ) : (
              <div className="insp-available-cta">
                <span className="cta-note">
                  ✨ यह स्थान रिक्त है! आप 255 मीटर चुनरी में यहाँ अपनी सेवा आरक्षित कर सकते हैं।
                </span>
                <button
                  type="button"
                  className="insp-select-btn"
                  onClick={() => {
                    handleSlotClick(inspectedSlot.slotNumber);
                    setInspectedSlot(null);
                  }}
                >
                  <Check size={14} /> इस सीट का चयन करें
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Modern Flight-Style Devotee Silhouette SVG Glyph
function PersonGlyph({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="26"
      viewBox="0 0 24 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="person-svg-glyph"
    >
      {/* Devotee Head */}
      <circle cx="12" cy="5.5" r="3.5" fill={color} />
      {/* Devotee Shoulders & Torso */}
      <path
        d="M6 16C6 12.6863 8.68629 10 12 10C15.3137 10 18 12.6863 18 16V18H6V16Z"
        fill={color}
      />
      {/* Devotee Sacred Folded Hands / Chunri Grip Base */}
      <path
        d="M4 21C4 19.8954 4.89543 19 6 19H18C19.1046 19 20 19.8954 20 21V23H4V21Z"
        fill={color}
        opacity="0.85"
      />
      {/* Inner sacred heart jewel */}
      <circle cx="12" cy="14" r="1.2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
