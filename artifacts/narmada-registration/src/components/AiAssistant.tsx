import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  FileCheck2,
  Key,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  askNarmadaSahayak,
  autoFillFormWithAI,
  generateAdminAnalyticsReport,
  generateDivineSankalp,
  getCustomApiKey,
  setCustomApiKey,
  type ExtractedFormValues,
} from '../lib/gemini';
import { holyAudio } from '../lib/sound';

// 1. AI Smart Auto-Fill Dialog
export function AiAutoFillModal({
  isOpen,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ExtractedFormValues) => void;
}) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleMic = () => {
    holyAudio.playRipple();
    if (!recognitionRef.current) {
      setError('आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया नीचे लिखकर भरें।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setError('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('कृपया अपना विवरण लिखें या बोलें।');
      return;
    }

    holyAudio.playRipple();
    setIsLoading(true);
    setError('');

    try {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }

      const extracted = await autoFillFormWithAI(inputText);
      holyAudio.playTempleChime();
      onApply(extracted);
      onClose();
    } catch (err: any) {
      setError(err.message || 'AI द्वारा जानकारी समझने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const setSample = (sample: string) => {
    holyAudio.playRipple();
    setInputText(sample);
    setError('');
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <span className="ai-gemini-badge">Gemini Pro AI</span>
            <h3>✨ स्मार्ट फॉर्म ऑटो-फिल (Voice / Text)</h3>
          </div>
          <button className="ai-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="ai-modal-body">
          <p className="ai-modal-desc">
            बोलकर या अपनी भाषा (हिंदी/Hinglish/English) में एक साधारण वाक्य लिखें। Gemini AI आपकी जानकारी स्वतः पहचानकर फॉर्म भर देगा:
          </p>

          <div className="ai-input-wrap">
            <textarea
              className="ai-textarea"
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError('');
              }}
              placeholder="उदा. मेरा नाम दीपक कुमार है, पिता श्री सोहनलाल, माता शांति देवी, उम्र 28 वर्ष, पुरुष, मोबाइल 9826112233, गाँव भेड़ाघाट, ब्लॉक पाटन, जिला जबलपुर..."
            />

            <button
              type="button"
              className={`mic-dictate-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleMic}
              title={isListening ? 'माइक बंद करें' : 'माइक से हिंदी में बोलें'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isListening ? 'सुन रहा हूँ...' : 'बोलें'}</span>
            </button>
          </div>

          {error && <p className="ai-modal-error">{error}</p>}

          <div className="sample-chips-row">
            <span className="chips-label">त्वरित उदाहरण:</span>
            <button
              type="button"
              className="sample-chip"
              onClick={() =>
                setSample(
                  'मेरा नाम राजेश पटेल है, पिता रामचरण पटेल, माता कौशल्या देवी, उम्र 35, पुरुष, मोबाइल 9827112233, गाँव शाहपुरा, जिला जबलपुर'
                )
              }
            >
              उदाहरण १ (जबलपुर)
            </button>
            <button
              type="button"
              className="sample-chip"
              onClick={() =>
                setSample(
                  'मेरा नाम अनीता राजपूत, पति महेंद्र राजपूत, माता कमला देवी, उम्र 42, महिला, मोबाइल 9425001122, गाँव गाडरवारा, ब्लॉक गाडरवारा, जिला नरसिंहपुर'
                )
              }
            >
              उदाहरण २ (नरसिंहपुर)
            </button>
          </div>
        </div>

        <div className="ai-modal-footer">
          <button type="button" className="ai-btn-secondary" onClick={onClose}>
            रद्द करें
          </button>
          <button
            type="button"
            className="ai-btn-primary"
            onClick={handleProcess}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spin-icon" /> AI पहचान रहा है...
              </>
            ) : (
              <>
                <Sparkles size={16} /> ✨ फॉर्म स्वतः भरें
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Narmada AI Sahayak (Interactive Spiritual & Yatra Assistant)
export function NarmadaAiChatModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: '।। श्री नर्मदे हर ।।\nमैं माँ नर्मदा जन्मोत्सव चुनरी यात्रा का पावन एआई मार्गदर्शक हूँ। 255 मीटर चुनरी यात्रा के नियम, घाट, समय, स्तुति मंत्र अथवा यात्रा मार्ग के विषय में आप मुझसे कुछ भी पूछ सकते हैं। 🙏',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    holyAudio.playRipple();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = newMessages.slice(1, -1);
      const reply = await askNarmadaSahayak(textToSend, history);
      holyAudio.playTempleChime();
      setMessages([...newMessages, { role: 'model', text: reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'model',
          text: `।। क्षमा करें ।। उत्तर प्राप्त करने में तकनीकी समस्या आई: ${err.message || 'कृपया पुनः प्रयास करें।'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (txt: string) => {
    holyAudio.playRipple();
    navigator.clipboard.writeText(txt);
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-chat-window" onClick={(e) => e.stopPropagation()}>
        <div className="ai-chat-header">
          <div className="chat-avatar-title">
            <div className="chat-avatar">
              <span>🌸</span>
            </div>
            <div>
              <h3>नर्मदा एआई पावन मार्गदर्शक</h3>
              <span className="chat-status-dot">● Powered by Gemini Pro</span>
            </div>
          </div>
          <button className="ai-modal-close" onClick={onClose} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message-row ${m.role}`}>
              <div className="chat-bubble">
                <div className="bubble-text">{m.text}</div>
                {m.role === 'model' && (
                  <button
                    className="bubble-copy-btn"
                    onClick={() => copyText(m.text)}
                    title="कॉपी करें"
                  >
                    <Copy size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message-row model">
              <div className="chat-bubble loading-bubble">
                <Sparkles size={15} className="spin-icon" /> माँ नर्मदा के ज्ञानकोष से उत्तर आ रहा है...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="chat-suggestions">
          <button
            type="button"
            className="suggestion-chip"
            onClick={() => handleSend('255 मीटर चुनरी यात्रा का क्या महत्व और पुण्य है?')}
          >
            🚩 255m चुनरी का महत्व?
          </button>
          <button
            type="button"
            className="suggestion-chip"
            onClick={() => handleSend('माँ नर्मदा का सबसे प्रभावशाली स्तुति मंत्र व अर्थ बताएं')}
          >
            🙏 नर्मदा स्तुति मंत्र
          </button>
          <button
            type="button"
            className="suggestion-chip"
            onClick={() => handleSend('चुनरी यात्रा में क्या वस्त्र व सावधानियां बरतनी चाहिए?')}
          >
            👗 यात्रा के नियम व वस्त्र
          </button>
        </div>

        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="माँ नर्मदा अथवा चुनरी यात्रा से संबंधित प्रश्न पूछें..."
            disabled={isLoading}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isLoading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// 3. API Key & Model Settings Modal
export function GeminiSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [keyInput, setKeyInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getCustomApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    holyAudio.playRipple();
    setCustomApiKey(keyInput);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <Key size={18} className="gold-icon" />
            <h3>Gemini Pro AI कॉन्फ़िगरेशन</h3>
          </div>
          <button className="ai-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="ai-modal-body">
          <div className="status-box-active">
            <span className="status-ping">●</span>
            <div>
              <strong>Gemini AI Active</strong>
              <p>सर्वर-साइड AI इंजन सक्रिय है। सभी सुविधाएँ (ऑटो-फिल, चैट, संकल्प पत्र) कार्यरत हैं।</p>
            </div>
          </div>

          <label className="field-label" style={{ marginTop: '16px' }}>
            <span className="field-label-text">
              वैकल्पिक: अपना व्यक्तिगत Gemini API Key दर्ज करें (Custom Key)
            </span>
          </label>
          <input
            type="password"
            className="control"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy... (खाली रखने पर डिफॉल्ट सर्वर की उपयोग होगी)"
          />
          <p style={{ fontSize: '11px', color: '#8faea0', marginTop: '6px' }}>
            यदि आपके पास Gemini Pro Paid Account की की (Key) है, तो उसे यहाँ सुरक्षित जोड़ सकते हैं।
          </p>
        </div>

        <div className="ai-modal-footer">
          <button type="button" className="ai-btn-secondary" onClick={onClose}>
            बंद करें
          </button>
          <button type="button" className="ai-btn-primary" onClick={handleSave}>
            {saved ? <><Check size={16} /> सहेज लिया गया!</> : 'सहेजें (Save Settings)'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Personalized Divine Sankalp & Blessing Box (Shown in VIP Pass)
export function PersonalizedDivineSankalpBox({
  devotee,
  slot,
  onSankalpGenerated,
}: {
  devotee: {
    name: string;
    fatherName: string;
    motherName: string;
    village: string;
    district: string;
    age: string;
  };
  slot: {
    slotNumber: number;
    side: 'left' | 'right';
    distanceFeet: number;
    distanceMeters: number;
  };
  onSankalpGenerated?: (text: string) => void;
}) {
  const [sankalpText, setSankalpText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSankalp = async () => {
    setLoading(true);
    try {
      const text = await generateDivineSankalp(devotee, slot);
      setSankalpText(text);
      onSankalpGenerated?.(text);
    } catch {
      setSankalpText(
        `।। श्री नर्मदे हर ।।\nत्वदीय पाद पंकजं नमामि देवि नर्मदे।\nभक्त ${devotee.name} (सुपुत्र श्री ${devotee.fatherName} एवं श्रीमती ${devotee.motherName}) द्वारा 255 मीटर की पावन चुनरी के स्थान #${slot.slotNumber} पर सेवा का पावन संकल्प स्वीकार हुआ। माँ नर्मदा आपके परिवार में सुख, आरोग्य व अखंड सौभाग्य प्रदान करें।`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSankalp();
  }, [devotee.name, slot.slotNumber]);

  const copySankalp = () => {
    holyAudio.playRipple();
    navigator.clipboard.writeText(sankalpText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sankalp-blessing-card">
      <div className="sankalp-header">
        <div className="sankalp-title-wrap">
          <Sparkles size={16} className="gold-sparkle" />
          <h4>माँ नर्मदा पावन संकल्प एवं शुभाशीर्वाद</h4>
          <span className="gemini-tag">Gemini Pro Divine</span>
        </div>
        <div className="sankalp-actions">
          <button
            type="button"
            className="sankalp-mini-btn"
            onClick={fetchSankalp}
            disabled={loading}
            title="पुनः आशीर्वाद प्राप्त करें"
          >
            <RefreshCw size={13} className={loading ? 'spin-icon' : ''} />
          </button>
          <button
            type="button"
            className="sankalp-mini-btn"
            onClick={copySankalp}
            title="कॉपी करें"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      <div className="sankalp-content">
        {loading ? (
          <div className="sankalp-skeleton">
            <Sparkles size={16} className="spin-icon" /> माँ नर्मदा का पावन वैयक्तिक आशीर्वाद तैयार हो रहा है...
          </div>
        ) : (
          <p className="sankalp-verse">{sankalpText}</p>
        )}
      </div>
    </div>
  );
}

// 5. Admin AI Analytics Report Modal
export function AdminReportModal({
  isOpen,
  onClose,
  records,
}: {
  isOpen: boolean;
  onClose: () => void;
  records: any[];
}) {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const checkedCount = records.filter((r) => r.status === 'checked').length;
      const maleCount = records.filter((r) => r.values.gender === 'male').length;
      const femaleCount = records.filter((r) => r.values.gender === 'female').length;

      const districts: Record<string, number> = {};
      let totalAge = 0;
      let validAgeCount = 0;

      records.forEach((r) => {
        const d = r.values.district?.trim() || 'अन्य';
        districts[d] = (districts[d] || 0) + 1;
        const a = parseInt(r.values.age, 10);
        if (!isNaN(a)) {
          totalAge += a;
          validAgeCount++;
        }
      });

      const avgAge = validAgeCount ? Math.round(totalAge / validAgeCount) : 0;

      const text = await generateAdminAnalyticsReport({
        total: records.length,
        checkedCount,
        districts,
        genderCount: { male: maleCount, female: femaleCount },
        averageAge: avgAge,
        slotsUsed: records.length,
      });

      setReport(text);
    } catch (err: any) {
      setReport(`रिपोर्ट तैयार करने में त्रुटि: ${err.message || 'पुनः प्रयास करें।'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <span className="ai-gemini-badge">Gemini Pro AI</span>
            <h3>✨ एआई यात्रा विश्लेषण एवं प्रबंधन रिपोर्ट</h3>
          </div>
          <button className="ai-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="ai-modal-body">
          {loading ? (
            <div className="report-loading">
              <RefreshCw size={24} className="spin-icon" />
              <p>Gemini Pro सभी {records.length} पंजीकृत भक्तों के डेटा का विश्लेषण कर रहा है...</p>
            </div>
          ) : (
            <div className="report-paper">
              <div className="report-badge-strip">
                <span>कुल पंजीकृत: {records.length}</span>
                <span>सत्यापित: {records.filter((r) => r.status === 'checked').length}</span>
                <span>255m चुनरी क्षमता: 417</span>
              </div>
              <div className="report-text-content">{report}</div>
            </div>
          )}
        </div>

        <div className="ai-modal-footer">
          <button
            type="button"
            className="ai-btn-secondary"
            onClick={generateReport}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> पुनः विश्लेषण करें
          </button>
          <button type="button" className="ai-btn-primary" onClick={onClose}>
            समाप्त (Done)
          </button>
        </div>
      </div>
    </div>
  );
}

