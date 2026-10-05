import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database, Globe, KeyRound } from 'lucide-react';
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

  const serverlessSoraSnippet = `// /api/sora.ts (Serverless Function at Root Level)
import type { IncomingMessage, ServerResponse } from 'http';

const MAS_DOMESTIC_RATES_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';

  if (!masKeyId) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'MAS_KEY_ID environment variable is missing.' }));
  }

  const response = await fetch(MAS_DOMESTIC_RATES_ENDPOINT, {
    method: 'GET',
    headers: {
      KeyId: masKeyId,
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}`;

  const envSnippet = `# Add this to your root .env file
MAS_KEY_ID="your_mas_key_id_here"`;

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
                Serverless MAS API Connection
              </h3>
              <p className="text-xs text-slate-500">
                Created in <code className="font-mono text-slate-800">/api/sora.ts</code> and{' '}
                <code className="font-mono text-slate-800">/api/health.ts</code>
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
          {/* Key Setup Instructions */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-emerald-950 text-sm">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Configuring Your MAS API Key</span>
              </div>
              <button
                onClick={() => copyToClipboard(envSnippet, 'env')}
                className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium"
              >
                {copiedSection === 'env' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy .env snippet</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              No API keys are hardcoded in the codebase. Set your MAS Gateway Key in your{' '}
              <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono">.env</code> file or serverless environment:
            </p>
            <pre className="bg-slate-950 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
              {envSnippet}
            </pre>
          </div>

          {/* Endpoint Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-900">MAS Gateway Target Endpoint:</div>
            <div className="font-mono text-[11px] text-slate-700 break-all select-all bg-white p-2 border border-slate-200 rounded">
              https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-800">Required Header:</span>
              <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-900">
                KeyId: &lt;MAS_KEY_ID&gt;
              </code>
            </div>
          </div>

          {/* Serverless Function Structure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Active Serverless Function (/api/sora.ts)
              </h4>
              <button
                onClick={() => copyToClipboard(serverlessSoraSnippet, 'serverless')}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                {copiedSection === 'serverless' ? (
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
              {serverlessSoraSnippet}
            </pre>
          </div>

          {/* Target Output Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Normalized JSON Output (/api/sora)
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

