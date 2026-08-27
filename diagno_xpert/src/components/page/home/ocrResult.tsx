import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  ShieldAlert,
  Salad,
  Sun,
  CalendarCheck,
} from "lucide-react";

/* ── Types ── */

interface Test {
  test_name: string;
  reference_value: string;
  unit: string;
  result: string;
}

interface OCRResult {
  patient_info: {
    patient_id: string;
    sex: string;
    age: string;
  };
  tests: Test[];
  total_tests: number;
  source_type: string;
  ocr_confidence?: { average: number };
  note?: string;
  quality?: string;
  report_generated?: string;
  ai_interpretation?: string;
  ai_error?: string;
}

type Status = "normal" | "high" | "low" | "unknown";

/* ── Helpers ── */

function detectStatus(result: string, reference: string): Status {
  const valueMatch = result.replace(/,/g, "").match(/[\d.]+/);
  if (!valueMatch) return "unknown";
  const value = parseFloat(valueMatch[0]);

  const clean = reference.replace(/,/g, "");

  // Range: "4.0 - 6.5" or "4.0-6.5"
  const rangeMatch = clean.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (value < min) return "low";
    if (value > max) return "high";
    return "normal";
  }

  // Less than: "< 200" or "≤200"
  const ltMatch = clean.match(/[<≤]\s*([\d.]+)/);
  if (ltMatch) return value <= parseFloat(ltMatch[1]) ? "normal" : "high";

  // Greater than: "> 10" or "≥10"
  const gtMatch = clean.match(/[>≥]\s*([\d.]+)/);
  if (gtMatch) return value >= parseFloat(gtMatch[1]) ? "normal" : "low";

  return "unknown";
}

/**
 * Try to split the AI text into named sections.
 * The prompt asks for: Summary | Abnormal Findings | Diet Plan | Daily Routine | Follow-up
 */
function parseSections(text: string) {
  const sectionDefs = [
    { key: "summary",   label: "Summary",            regex: /\*{0,2}Summary\*{0,2}/i },
    { key: "findings",  label: "Abnormal Findings",  regex: /\*{0,2}Abnormal Findings?\*{0,2}/i },
    { key: "diet",      label: "Diet Plan",           regex: /\*{0,2}Diet Plan\*{0,2}/i },
    { key: "routine",   label: "Daily Routine",       regex: /\*{0,2}Daily Routine\*{0,2}/i },
    { key: "followup",  label: "Follow-up",           regex: /\*{0,2}Follow[\s-]?up\*{0,2}/i },
  ];

  // Find positions of each marker
  const positions: { idx: number; key: string; label: string }[] = [];
  for (const s of sectionDefs) {
    const match = text.search(s.regex);
    if (match !== -1) positions.push({ idx: match, key: s.key, label: s.label });
  }
  positions.sort((a, b) => a.idx - b.idx);

  if (positions.length < 2) return null; // fallback to plain text

  const result: { key: string; label: string; content: string }[] = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx;
    const end = i + 1 < positions.length ? positions[i + 1].idx : text.length;

    // Remove the heading itself from the content
    let content = text.substring(start, end);
    content = content.replace(sectionDefs.find((s) => s.key === positions[i].key)!.regex, "").replace(/^\s*[:\-–]\s*/, "").trim();

    result.push({ key: positions[i].key, label: positions[i].label, content });
  }
  return result;
}

/* ── Sub-components ── */

const statusConfig: Record<Status, {
  badge: string;
  card: string;
  dot: string;
  icon: React.ReactNode;
  label: string;
}> = {
  normal: {
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    card: "border-l-4 border-green-400 dark:border-green-600",
    dot: "bg-green-400",
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    label: "Normal",
  },
  high: {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    card: "border-l-4 border-red-400 dark:border-red-600",
    dot: "bg-red-400",
    icon: <TrendingUp className="w-4 h-4 text-red-500" />,
    label: "High",
  },
  low: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    card: "border-l-4 border-orange-400 dark:border-orange-600",
    dot: "bg-orange-400",
    icon: <TrendingDown className="w-4 h-4 text-orange-500" />,
    label: "Low",
  },
  unknown: {
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    card: "border-l-4 border-gray-300 dark:border-gray-600",
    dot: "bg-gray-400",
    icon: <Activity className="w-4 h-4 text-gray-400" />,
    label: "—",
  },
};

function TestCard({ test }: { test: Test }) {
  const status = detectStatus(test.result, test.reference_value);
  const cfg = statusConfig[status];

  return (
    <div
      className={`p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${cfg.card} flex flex-col gap-2`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
          {test.test_name}
        </span>
        <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      <div className="flex items-end justify-between text-sm">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Result</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {test.result}
            {test.unit && <span className="ml-1 text-xs font-normal text-gray-500">{test.unit}</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Reference</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{test.reference_value || "—"}</p>
        </div>
      </div>
    </div>
  );
}

const sectionIcons: Record<string, React.ReactNode> = {
  summary:  <Stethoscope  className="w-5 h-5 text-blue-500" />,
  findings: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  diet:     <Salad         className="w-5 h-5 text-emerald-500" />,
  routine:  <Sun           className="w-5 h-5 text-orange-400" />,
  followup: <CalendarCheck className="w-5 h-5 text-purple-500" />,
};

const sectionColors: Record<string, string> = {
  summary:  "border-blue-400   dark:border-blue-600   bg-blue-50   dark:bg-blue-950/30",
  findings: "border-amber-400  dark:border-amber-600  bg-amber-50  dark:bg-amber-950/20",
  diet:     "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
  routine:  "border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/20",
  followup: "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/20",
};

/* ── Main component ── */

export default function OCRReport({ result }: { result: OCRResult | null }) {
  if (!result) return null;

  // Count statuses
  const statuses = result.tests.map((t) => detectStatus(t.result, t.reference_value));
  const normalCount  = statuses.filter((s) => s === "normal").length;
  const highCount    = statuses.filter((s) => s === "high").length;
  const lowCount     = statuses.filter((s) => s === "low").length;

  // Parse AI sections
  const sections = result.ai_interpretation ? parseSections(result.ai_interpretation) : null;

  return (
    <div className="w-full  mx-auto px-4 mb-24 space-y-6">

      {/* ── Patient info + confidence row ── */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
            Patient Info
          </h2>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="text-gray-400 dark:text-gray-500">ID:</span> {result.patient_info.patient_id || "—"}</p>
            <p><span className="text-gray-400 dark:text-gray-500">Gender:</span> {result.patient_info.sex || "—"}</p>
            <p><span className="text-gray-400 dark:text-gray-500">Age:</span> {result.patient_info.age || "—"}</p>
            {result.note && <p><span className="text-gray-400 dark:text-gray-500">Note:</span> {result.note}</p>}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
            Report Overview
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200/60 dark:border-green-800/40 p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{normalCount}</p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">Normal</p>
            </div>
            <div className="flex-1 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 p-3 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highCount}</p>
              <p className="text-xs text-red-700 dark:text-red-500 mt-0.5">High</p>
            </div>
            <div className="flex-1 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/40 p-3 text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lowCount}</p>
              <p className="text-xs text-orange-700 dark:text-orange-500 mt-0.5">Low</p>
            </div>
          </div>

          {result.ocr_confidence && (() => {
            const avg = result.ocr_confidence!.average;
            const label = avg >= 85 ? "Excellent" : avg >= 70 ? "Good" : avg >= 50 ? "Fair" : "Poor";
            const color = avg >= 70 ? "text-green-600 dark:text-green-400" : avg >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
            return (
              <p className={`mt-3 text-xs ${color}`}>
                OCR Confidence: <strong>{avg}%</strong> ({label})
              </p>
            );
          })()}
        </div>
      </div> */}

      {/* ── Test result cards ── */}
      <div>
        <h2 className="text-md font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <HeartPulse className="w-4 h-4" />
          Test Results · {result.total_tests} tests
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.tests.map((test, idx) => (
            <TestCard key={idx} test={test} />
          ))}
        </div>
      </div>

      {/* ── AI Interpretation ── */}
      {(result.ai_interpretation || result.ai_error) && (
        <div>
          <h2 className="text-md font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            AI Interpretation
          </h2>

          {result.ai_error && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-md text-amber-700 dark:text-amber-400">
              {result.ai_error}
            </div>
          )}

          {result.ai_interpretation && (
            sections ? (
              /* Parsed sections → 4 colored cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((sec) => (
                  <div
                    key={sec.key}
                    className={`p-4 rounded-xl border-l-4 shadow-sm ${sectionColors[sec.key] ?? "border-gray-300 bg-gray-50 dark:bg-gray-800"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {sectionIcons[sec.key]}
                      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">{sec.label}</h3>
                    </div>
                    <p className="text-md text-gray-700 dark:text-gray-300 leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback — clean single card when sections can't be parsed */
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-md text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {result.ai_interpretation}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
