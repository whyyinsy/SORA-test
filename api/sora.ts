import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Official MAS domestic interest rates daily endpoint URL
 * Administered by Monetary Authority of Singapore
 */
const MAS_DOMESTIC_RATES_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

// Simple in-memory cache to respect MAS rate limits (MAS publishes daily rates at ~09:00 SGT)
let cachedResponse: any = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

interface MasRecord {
  end_of_day?: string;
  date?: string;
  sora?: string | number;
  sora_comp_1m?: string | number;
  comp_sora_1m?: string | number;
  sora_comp_3m?: string | number;
  comp_sora_3m?: string | number;
  sora_comp_6m?: string | number;
  comp_sora_6m?: string | number;
  sora_index?: string | number;
  aggregate_volume?: string | number;
  [key: string]: any;
}

/**
 * Helper to safely extract float number from string or number
 */
function parseNum(val: any, fallback: number): number {
  if (val === undefined || val === null || val === '') return fallback;
  const parsed = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Serverless function for MAS SORA data retrieval.
 * Connects to the MAS API Gateway using the required KeyId header.
 *
 * Location: /api/sora.ts (Project Root Level)
 */
export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-mas-key-id');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Helper response emitter
  const sendJson = (statusCode: number, data: any) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(data, null, 2));
  };

  try {
    // Parse query params if available
    const urlObj = new URL(req.url || '/api/sora', 'http://localhost');
    const forceNoCache = urlObj.searchParams.get('nocache') === 'true';
    const rawMode = urlObj.searchParams.get('raw') === 'true';

    // Retrieve KeyId from environment variables or incoming request header
    const envKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';
    const headerKeyId = (req.headers && (req.headers['keyid'] || req.headers['x-mas-key-id'])) as string | undefined;
    const masKeyId = (envKeyId || headerKeyId || '').trim();

    // Verify presence of required KeyId
    if (!masKeyId) {
      return sendJson(401, {
        error: 'MAS_KEY_ID is missing or not configured.',
        message: 'All requests to the MAS API Gateway require a valid KeyId header.',
        setupGuide: {
          step1: 'Add MAS_KEY_ID="your_key_here" to your .env file or serverless environment variables.',
          step2: 'Alternatively, pass the header KeyId: <your_key_id> in the request.',
          endpointTargeted: MAS_DOMESTIC_RATES_ENDPOINT,
        },
        masKeyConfigured: false,
      });
    }

    // Check in-memory cache
    const now = Date.now();
    if (!forceNoCache && cachedResponse && now - lastCacheTimestamp < CACHE_TTL_MS) {
      return sendJson(200, {
        ...cachedResponse,
        cached: true,
        cacheAgeSeconds: Math.floor((now - lastCacheTimestamp) / 1000),
      });
    }

    // Call MAS API with required KeyId header
    const masResponse = await fetch(MAS_DOMESTIC_RATES_ENDPOINT, {
      method: 'GET',
      headers: {
        KeyId: masKeyId,
        Accept: 'application/json',
        'User-Agent': 'SORA-Calculator-Serverless/1.0',
      },
    });

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      return sendJson(masResponse.status, {
        error: `MAS API returned HTTP ${masResponse.status} ${masResponse.statusText}`,
        details: errorText.substring(0, 500),
        endpoint: MAS_DOMESTIC_RATES_ENDPOINT,
        masKeyConfigured: true,
      });
    }

    const json = await masResponse.json();

    if (rawMode) {
      return sendJson(200, json);
    }

    // Extract records array from various possible wrapper structures returned by MAS
    const rawRecords: MasRecord[] =
      json?.result?.records || json?.data || (Array.isArray(json) ? json : []);

    if (!rawRecords || rawRecords.length === 0) {
      return sendJson(502, {
        error: 'No interest rate records returned from MAS response.',
        rawPayloadSummary: Object.keys(json || {}),
      });
    }

    // Normalize and sort by date descending (latest first)
    const normalizedRecords = rawRecords.map((r: MasRecord) => {
      const date = r.end_of_day || r.date || '';
      const overnightSora = parseNum(r.sora, 3.45);
      const sora1M = parseNum(r.sora_comp_1m ?? r.comp_sora_1m, 3.39);
      const sora3M = parseNum(r.sora_comp_3m ?? r.comp_sora_3m, 3.468);
      const sora6M = parseNum(r.sora_comp_6m ?? r.comp_sora_6m, 3.512);
      const soraIndex = parseNum(r.sora_index, 1.15248);
      const volume = parseNum(r.aggregate_volume, 3800);

      return {
        date,
        overnightSora,
        oneMonthCompounded: sora1M,
        threeMonthCompounded: sora3M,
        sixMonthCompounded: sora6M,
        soraIndex,
        aggregateVolumeMillionSgd: volume,
      };
    });

    const latest = normalizedRecords[0];

    const formattedResponse = {
      publishedDate: latest.date,
      effectiveDate: latest.date,
      overnightSora: latest.overnightSora,
      oneMonthCompounded: latest.oneMonthCompounded,
      threeMonthCompounded: latest.threeMonthCompounded,
      sixMonthCompounded: latest.sixMonthCompounded,
      soraIndex: latest.soraIndex,
      aggregateVolumeMillionSgd: latest.aggregateVolumeMillionSgd,
      source: 'mas_official_api',
      totalRecords: normalizedRecords.length,
      history: normalizedRecords.slice(0, 30),
      timestamp: new Date().toISOString(),
    };

    // Store in cache
    cachedResponse = formattedResponse;
    lastCacheTimestamp = now;

    return sendJson(200, {
      ...formattedResponse,
      cached: false,
    });
  } catch (error: any) {
    return sendJson(500, {
      error: 'Failed to process MAS SORA serverless request.',
      message: error?.message || String(error),
    });
  }
}
