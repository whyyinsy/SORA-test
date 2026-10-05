import type { IncomingMessage, ServerResponse } from 'http';

interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  masKeyConfigured: boolean;
  masKeyIdMasked?: string;
  endpoints: {
    health: string;
    sora: string;
  };
}

/**
 * Serverless health check endpoint.
 * Evaluates runtime health and verifies whether the MAS_KEY_ID environment variable is provided.
 */
export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const masKey = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';
  const isConfigured = Boolean(masKey.trim());

  // Mask key for safety (e.g. "mas_***1234")
  const maskedKey = isConfigured
    ? masKey.length > 8
      ? `${masKey.substring(0, 4)}...${masKey.substring(masKey.length - 4)}`
      : '***configured***'
    : undefined;

  const payload: HealthResponse = {
    status: 'ok',
    service: 'sora-mas-serverless-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    masKeyConfigured: isConfigured,
    masKeyIdMasked: maskedKey,
    endpoints: {
      health: '/api/health',
      sora: '/api/sora',
    },
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json(payload);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(payload, null, 2));
}
