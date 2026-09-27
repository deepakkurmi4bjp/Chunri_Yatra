import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.VITE_PORT || '3000';
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || '/';

// Central Persistent Storage Configuration
const DATA_DIR = path.resolve(import.meta.dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readRegistrations(): any[] {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

function writeRegistrations(records: any[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing registrations file:', err);
  }
}

function calculateAllocation(slotNumber: number) {
  const distanceFeet = Math.ceil(slotNumber / 2) * 2;
  const side = slotNumber % 2 === 1 ? 'left' : 'right';
  return {
    slotNumber,
    side,
    distanceFeet,
    distanceMeters: Number((distanceFeet * 0.3048).toFixed(2)),
  };
}

function extractJson(str: string): Record<string, unknown> {
  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return {};
}

// Resilient multi-model Gemini caller
async function callGeminiApi(
  apiKey: string,
  contents: unknown[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite-preview'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options.temperature ?? 0.3,
            maxOutputTokens: options.maxTokens ?? 800,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = (errJson as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
        lastError = new Error(errMsg);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
}

function registerApiMiddlewares(server: any) {
  server.middlewares.use(async (req: any, res: any, next: any) => {
    const url = req.url || '';
    const method = req.method || 'GET';

    // 1. Centralized Multi-device Registration Database API
    if (url.startsWith('/api/registrations')) {
      let bodyText = '';
      req.on('data', (chunk: any) => {
        bodyText += chunk;
      });

      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

        try {
          const body = bodyText ? JSON.parse(bodyText) : {};

          // A. GET /api/registrations -> list all registered devotees
          if (method === 'GET') {
            const records = readRegistrations();
            res.end(JSON.stringify({ ok: true, records, total: records.length }));
            return;
          }

          // B. POST /api/registrations/sync -> merge local data with server
          if (method === 'POST' && url.includes('/sync')) {
            const incoming = Array.isArray(body.records) ? body.records : [];
            const current = readRegistrations();
            const idMap = new Set(current.map((r: any) => r.id));

            for (const item of incoming) {
              if (item && item.id && !idMap.has(item.id)) {
                if (!item.allocation || (!item.allocation.slotNumber && !item.allocation.isPendingApproval && item.volunteerStatus !== 'pending')) {
                  const age = parseInt(item.values?.age || '30', 10);
                  const gender = item.values?.gender || '';
                  let zoneStart = 1;
                  let zoneEnd = 100;
                  let zoneName = 'जोन १: महिलाएं/कन्याएं';
                  let zoneCat = 'महिलाएं एवं कन्याएं (Females/Girls)';

                  if (gender === 'female') {
                    zoneStart = 1;
                    zoneEnd = 100;
                    zoneName = 'जोन १: महिलाएं/कन्याएं';
                    zoneCat = 'महिलाएं एवं कन्याएं (Females/Girls)';
                  } else if (gender === 'male' && !isNaN(age) && age > 35) {
                    zoneStart = 201;
                    zoneEnd = 316;
                    zoneName = 'जोन ३: 35+ वर्ष के पुरुष';
                    zoneCat = '35 वर्ष से अधिक उम्र के पुरुष (Men > 35 yrs)';
                  } else {
                    zoneStart = 317;
                    zoneEnd = 417;
                    zoneName = 'जोन ४: युवा लड़के/पुरुष (<=35)';
                    zoneCat = '35 वर्ष से कम के लड़के/युवा पुरुष (Men <= 35 yrs)';
                  }

                  const occupied = new Set(
                    current
                      .filter((r: any) => r.allocation?.slotNumber && !r.allocation?.isPendingApproval)
                      .map((r: any) => r.allocation.slotNumber)
                  );
                  let assignedSlot = zoneStart;
                  for (let s = zoneStart; s <= zoneEnd; s++) {
                    if (!occupied.has(s)) {
                      assignedSlot = s;
                      break;
                    }
                  }

                  const distanceFeet = Math.ceil(assignedSlot / 2) * 2;
                  const side = assignedSlot % 2 === 1 ? 'left' : 'right';
                  item.allocation = {
                    slotNumber: assignedSlot,
                    side,
                    distanceFeet,
                    distanceMeters: Number((distanceFeet * 0.3048).toFixed(2)),
                    zoneName,
                    zoneCategory: zoneCat,
                  };
                }
                current.unshift(item);
                idMap.add(item.id);
              }
            }

            writeRegistrations(current);
            res.end(JSON.stringify({ ok: true, records: current }));
            return;
          }

          // C. POST /api/registrations -> create new registration
          if (method === 'POST') {
            const newRecord = body.record || body;
            if (!newRecord || !newRecord.values?.name) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'भक्त का नाम आवश्यक है' }));
              return;
            }

            const current = readRegistrations();
            const existingIdx = current.findIndex((r: any) => r.id === newRecord.id);

            if (existingIdx >= 0) {
              current[existingIdx] = { ...current[existingIdx], ...newRecord };
              writeRegistrations(current);
              res.end(JSON.stringify({ ok: true, record: current[existingIdx], total: current.length }));
              return;
            }

            // Assign slot allocation if not already provided
            // CRITICAL: Respect approved or rejected status; only pending applicants wait for verification!
            const isVolunteerPending =
              (newRecord.volunteerStatus === 'pending' ||
                newRecord.allocation?.isPendingApproval ||
                Boolean(newRecord.values?.isVolunteer)) &&
              newRecord.volunteerStatus !== 'approved' &&
              newRecord.volunteerStatus !== 'rejected';

            if (isVolunteerPending) {
              newRecord.volunteerStatus = 'pending';
              newRecord.allocation = {
                slotNumber: 0,
                side: 'left',
                distanceFeet: 0,
                distanceMeters: 0,
                zoneName: 'जोन २: स्वयंसेवक/स्वयंसेविकाएं',
                zoneCategory: 'समर्पित स्वयंसेवक एवं व्यवस्थापक दल',
                isPendingApproval: true,
              };
            } else if (newRecord.volunteerStatus === 'approved' && (!newRecord.allocation || !newRecord.allocation.slotNumber)) {
              // Approved volunteer: Allocate next free slot in Zone 2 (50-100m, slots 101-200)
              const occupied = new Set(
                current
                  .filter((r: any) => r.allocation?.slotNumber && !r.allocation?.isPendingApproval)
                  .map((r: any) => r.allocation.slotNumber)
              );
              let assignedSlot = 101;
              for (let s = 101; s <= 200; s++) {
                if (!occupied.has(s)) {
                  assignedSlot = s;
                  break;
                }
              }
              const distanceFeet = Math.ceil(assignedSlot / 2) * 2;
              const side = assignedSlot % 2 === 1 ? 'left' : 'right';
              newRecord.allocation = {
                slotNumber: assignedSlot,
                side,
                distanceFeet,
                distanceMeters: Number((distanceFeet * 0.3048).toFixed(2)),
                zoneName: 'जोन २: स्वयंसेवक/स्वयंसेविकाएं',
                zoneCategory: 'समर्पित स्वयंसेवक एवं व्यवस्थापक दल',
                isPendingApproval: false,
              };
            } else if (!newRecord.allocation || !newRecord.allocation.slotNumber) {
              const age = parseInt(newRecord.values?.age || '30', 10);
              const gender = newRecord.values?.gender || '';
              let zoneStart = 1;
              let zoneEnd = 100;
              let zoneName = 'जोन १: महिलाएं/कन्याएं';
              let zoneCat = 'महिलाएं एवं कन्याएं (Females/Girls)';

              if (gender === 'female') {
                zoneStart = 1;
                zoneEnd = 100;
                zoneName = 'जोन १: महिलाएं/कन्याएं';
                zoneCat = 'महिलाएं एवं कन्याएं (Females/Girls)';
              } else if (gender === 'male' && !isNaN(age) && age > 35) {
                zoneStart = 201;
                zoneEnd = 316;
                zoneName = 'जोन ३: 35+ वर्ष के पुरुष';
                zoneCat = '35 वर्ष से अधिक उम्र के पुरुष (Men > 35 yrs)';
              } else {
                zoneStart = 317;
                zoneEnd = 417;
                zoneName = 'जोन ४: युवा लड़के/पुरुष (<=35)';
                zoneCat = '35 वर्ष से कम के लड़के/युवा पुरुष (Men <= 35 yrs)';
              }

              const occupied = new Set(
                current
                  .filter((r: any) => r.allocation?.slotNumber && !r.allocation?.isPendingApproval)
                  .map((r: any) => r.allocation.slotNumber)
              );
              let assignedSlot = zoneStart;
              for (let s = zoneStart; s <= zoneEnd; s++) {
                if (!occupied.has(s)) {
                  assignedSlot = s;
                  break;
                }
              }

              const distanceFeet = Math.ceil(assignedSlot / 2) * 2;
              const side = assignedSlot % 2 === 1 ? 'left' : 'right';
              newRecord.allocation = {
                slotNumber: assignedSlot,
                side,
                distanceFeet,
                distanceMeters: Number((distanceFeet * 0.3048).toFixed(2)),
                zoneName,
                zoneCategory: zoneCat,
              };
            }
            newRecord.createdAt = newRecord.createdAt || new Date().toISOString();
            newRecord.status = newRecord.status || 'new';

            current.unshift(newRecord);
            writeRegistrations(current);

            res.end(JSON.stringify({ ok: true, record: newRecord, total: current.length }));
            return;
          }

          // D. PUT /api/registrations/:id -> update status or details
          if (method === 'PUT') {
            const pathParts = url.split('?')[0].split('/');
            const targetId = pathParts[pathParts.length - 1];
            const current = readRegistrations();
            const idx = current.findIndex((r: any) => r.id === targetId);

            if (idx === -1) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'पंजीयन रिकॉर्ड नहीं मिला' }));
              return;
            }

            current[idx] = {
              ...current[idx],
              ...body,
              values: body.values ? { ...current[idx].values, ...body.values } : current[idx].values,
              allocation: body.allocation ? { ...current[idx].allocation, ...body.allocation } : current[idx].allocation,
            };
            writeRegistrations(current);
            res.end(JSON.stringify({ ok: true, record: current[idx] }));
            return;
          }

          // E. DELETE /api/registrations/:id -> remove registration
          if (method === 'DELETE') {
            const pathParts = url.split('?')[0].split('/');
            const targetId = pathParts[pathParts.length - 1];
            let current = readRegistrations();
            const beforeCount = current.length;
            current = current.filter((r: any) => r.id !== targetId);

            writeRegistrations(current);
            res.end(JSON.stringify({ ok: true, deleted: beforeCount !== current.length }));
            return;
          }

          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message || 'Database error' }));
        }
      });
      return;
    }

    // 2. Gemini Pro AI API Endpoints
    if (url.startsWith('/api/gemini/')) {
      const endpoint = url.replace('/api/gemini/', '').split('?')[0];

      let bodyText = '';
      req.on('data', (chunk: any) => {
        bodyText += chunk;
      });

      req.on('end', async () => {
        try {
          res.setHeader('Content-Type', 'application/json');

          const body = bodyText ? JSON.parse(bodyText) : {};
          const clientApiKey = (req.headers['x-gemini-key'] as string) || '';
          const apiKey = clientApiKey.trim() || process.env.GEMINI_API_KEY || '';

          if (!apiKey) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Gemini API key is not configured.' }));
            return;
          }

          if (endpoint === 'autofill') {
            const userText = body.text || '';
            if (!userText.trim()) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Text prompt is required for auto-fill.' }));
              return;
            }

            const prompt = `You are a specialized smart form parser for "Shri Maa Narmada Chunri Yatra Registration".
Extract all registration details from this user input (which may be in Hindi, Hinglish, or English):
"${userText}"

Return ONLY a valid JSON object with these keys (fill whatever is mentioned, leave empty string "" if not mentioned):
{
  "name": "",
  "fatherName": "",
  "motherName": "",
  "age": "",
  "gender": "", // "male" or "female"
  "mobile": "", // 10 digits only
  "whatsapp": "", // 10 digits only
  "village": "",
  "block": "",
  "district": "",
  "allergy": ""
}
Do NOT include markdown formatting or extra text. Just the raw JSON object.`;

            const reply = await callGeminiApi(
              apiKey,
              [{ parts: [{ text: prompt }] }],
              { temperature: 0.1 },
            );

            const parsedData = extractJson(reply);
            res.end(JSON.stringify({ ok: true, data: parsedData }));
            return;
          }

          if (endpoint === 'sankalp') {
            const devotee = body.devotee || {};
            const slot = body.slot || {};

            const prompt = `You are a revered Vedic Acharya on the holy banks of sacred river Maa Narmada during the historic 255-meter Chunri Yatra (255 मीटर चुनरी यात्रा).
Compose a divine, personalized, deeply pious Sanskrit & Hindi "पावन चुनरी संकल्प व शुभाशीर्वाद पत्र" for the devotee:
- भक्त का नाम: ${devotee.name}
- आत्मज श्री: ${devotee.fatherName} एवं श्रीमती: ${devotee.motherName}
- निवास: ${devotee.village}, ${devotee.district}
- आवंटित 255m चुनरी स्थान: स्लॉट #${slot.slotNumber} (${slot.side === 'left' ? 'बायाँ छोर' : 'दायाँ छोर'} से ${slot.distanceFeet} फीट / ${slot.distanceMeters} मीटर)

Structure:
1. आरम्भ: "।। श्री नर्मदे हर ।। त्वदीय पाद पंकजं नमामि देवि नर्मदे ।।"
2. संकल्प: माँ रेवा के जन्मोत्सव पर 255 मीटर की चुनरी पकड़ने का पावन संकल्प।
3. शुभाशीर्वाद: भक्त ${devotee.name} व उनके पूरे परिवार के लिए सुख, शांति, समृद्धि व दीर्घायु का आशीर्वाद।
Word count: 90-120 words. Pure, heartfelt, devotional tone.`;

            const reply = await callGeminiApi(
              apiKey,
              [{ parts: [{ text: prompt }] }],
              { temperature: 0.6 },
            );

            res.end(JSON.stringify({ ok: true, sankalp: reply }));
            return;
          }

          if (endpoint === 'chat') {
            const userPrompt = body.prompt || '';
            const history = body.history || [];

            const systemInstruction = `आप "नर्मदा एआई पावन मार्गदर्शक" (Narmada AI Sahayak) हैं।
आप श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा के अधिकृत आध्यात्मिक एवं यात्रा मार्गदर्शक हैं।
आप माँ नर्मदा पुराण, परिक्रमा, चुनरी यात्रा (255 मीटर चुनरी, 417 स्थान), घाटों (अमरकंटक, भेड़ाघाट, नर्मदापुरम/होशंगाबाद, ओंकारेश्वर, महेश्वर), सुरक्षा, यात्रा नियम, और स्तुति-मंत्रों के विशेषज्ञ हैं।
हमेशा विनम्र, सस्नेह और श्रद्धा भाव से उत्तर दें। अभिवादन में "।। नर्मदे हर ।।" कहें।
भक्तों के प्रश्नों का सटीक, उपयोगी और प्रेरणादायक उत्तर हिंदी में दें।`;

            const contents = [
              { role: 'user', parts: [{ text: systemInstruction }] },
              { role: 'model', parts: [{ text: '।। नर्मदे हर ।। मैं माँ नर्मदा चुनरी यात्रा का पावन एआई मार्गदर्शक हूँ। आपकी क्या सेवा करूँ?' }] },
              ...history.map((h: { role: string; text: string }) => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.text }],
              })),
              { role: 'user', parts: [{ text: userPrompt }] },
            ];

            const reply = await callGeminiApi(
              apiKey,
              contents,
              { temperature: 0.6, maxTokens: 600 },
            );

            res.end(JSON.stringify({ ok: true, reply }));
            return;
          }

          if (endpoint === 'analytics') {
            const summary = body.summary || {};
            const prompt = `आप श्री माँ नर्मदा चुनरी यात्रा आयोजन समिति के मुख्य विश्लेषक हैं।
नीचे दिए गए पंजीकृत यात्रियों के आँकड़ों का विश्लेषण कर आयोजन समिति के लिए 120-150 शब्दों की संक्षिप्त, प्रभावशाली 'एआई आयोजन रिपोर्ट' तैयार करें:
- कुल पंजीकृत भक्त: ${summary.total}
- सत्यापित (Checked): ${summary.checkedCount}
- पुरुष: ${summary.genderCount?.male || 0}, महिला: ${summary.genderCount?.female || 0}
- औसत आयु: ${summary.averageAge || 'N/A'} वर्ष
- चुनरी स्थान उपयोग: ${summary.slotsUsed} / 417 (255 मीटर चुनरी)
- मुख्य जिले: ${JSON.stringify(summary.districts || {})}

रिपोर्ट में:
1. भागीदारी का सारांश व जनसांख्यिकी
2. दोनों छोर (बायाँ व दायाँ) के संतुलन व व्यवस्था
3. वरिष्ठ नागरिकों व महिलाओं के लिए विशेष सुरक्षा व जल-पान सुझाव।`;

            const reply = await callGeminiApi(
              apiKey,
              [{ parts: [{ text: prompt }] }],
              { temperature: 0.4 },
            );

            res.end(JSON.stringify({ ok: true, report: reply }));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: `Unknown Gemini endpoint: ${endpoint}` }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: (err as Error).message || 'Server error' }));
        }
      });
      return;
    }

    next();
  });
}

function narmadaBackendPlugin(): Plugin {
  return {
    name: 'narmada-backend-server',
    configureServer(server) {
      registerApiMiddlewares(server);
    },
    configurePreviewServer(server) {
      registerApiMiddlewares(server);
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    narmadaBackendPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
