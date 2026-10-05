import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database, Globe, ExternalLink } from 'lucide-react';
import { MasBenchmarkRates } from '../types/sora';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRates: MasBenchmarkRates;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  currentRates,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleExpressCode = `// server.ts or src/api/sora.ts (Express backend proxy)
import express from 'express';

const app = express();
const MAS_SORA_DATASTORE_URL =
  'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3042-45a4-97c3-9515040a33f2&limit=10&sort=end_of_day%20desc';

// Daily in-memory cache (MAS updates SORA daily at 09:00 SGT)
let cachedSora: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

app.get('/api/sora', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedSora && (now - lastFetchTime < CACHE_TTL_MS)) {
      return res.json(cachedSora);
    }

    const response = await fetch(MAS_SORA_DATASTORE_URL);
    const data = await response.json();
    const records = data?.result?.records || [];

    if (records.length > 0) {
      const latest = records[0];
      cachedSora = {
        publishedDate: latest.end_of_day,
        effectiveDate: latest.end_of_day,
        overnightSora: parseFloat(latest.sora),
        oneMonthCompounded: parseFloat(latest.sora_comp_1m),
        threeMonthCompounded: parseFloat(latest.sora_comp_3m),
        sixMonthCompounded: parseFloat(latest.sora_comp_6m),
        soraIndex: parseFloat(latest.sora_index),
        aggregateVolumeMillionSgd: parseFloat(latest.aggregate_volume),
      };
      lastFetchTime = now;
      return res.json(cachedSora);
    }

    res.status(502).json({ error: 'No records returned from MAS' });
  } catch (error) {
    console.error('Failed to fetch MAS rates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

  const sampleJsonFormat = JSON.stringify(
    {
      publishedDate: currentRates.publishedDate,
      effectiveDate: currentRates.effectiveDate,
      overnightSora: currentRates.overnightSora,
      oneMonthCompounded: currentRates.oneMonthCompounded,
      threeMonthCompounded: currentRates.threeMonthCompounded,
      sixMonthCompounded: currentRates.sixMonthCompounded,
      soraIndex: currentRates.soraIndex,
      aggregateVolumeMillionSgd: currentRates.aggregateVolumeMillionSgd,
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Backend Integration Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-use backend proxy implementation for MAS SORA Datastore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Architecture Concept */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>How Frontend & Backend Communicate</span>
            </h4>
            <p className="leading-relaxed text-slate-600">
              The frontend is currently powered by a dual-tier client architecture in{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-mono">
                src/services/soraService.ts
              </code>
              . It checks for a local proxy route at{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-mono">
                /api/sora
              </code>
              . When your backend is ready, simply mount the Express route below, and the frontend
              will automatically connect seamlessly!
            </p>
          </div>

          {/* Express Proxy Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                1. Express Route Proxy Implementation
              </h4>
              <button
                onClick={() => copyToClipboard(sampleExpressCode, 'express')}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                {copiedSection === 'express' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-lg overflow-x-auto font-mono text-[11px] leading-relaxed border border-slate-800">
              {sampleExpressCode}
            </pre>
          </div>

          {/* Target JSON Payload Specification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                2. Expected JSON Response Schema (/api/sora)
              </h4>
              <button
                onClick={() => copyToClipboard(sampleJsonFormat, 'json')}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                {copiedSection === 'json' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-lg overflow-x-auto font-mono text-[11px] border border-slate-800">
              {sampleJsonFormat}
            </pre>
          </div>

          {/* Official MAS API Source */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="font-semibold text-slate-900">Official MAS Open API Endpoint:</div>
            <div className="font-mono text-[11px] text-slate-600 break-all select-all bg-white p-2 border border-slate-200 rounded">
              https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3042-45a4-97c3-9515040a33f2
            </div>
            <div className="text-[11px] text-slate-500">
              Published every Singapore business day at 09:00 SGT for the preceding business day.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
