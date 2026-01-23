/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { detectLocationFromIP, getClientIP } from './geolocation';

/**
 * API Routes for Hemplifier
 * This would typically run on your backend server (Express, Next.js API routes, etc.)
 */

/**
 * GET /api/location
 * Returns currency based on user's IP address
 */
export async function handleLocationRequest(req: Request): Promise<Response> {
  try {
    // Extract IP from request headers
    const headers: Record<string, string | undefined> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const clientIP = getClientIP(headers);

    console.log('[API] Detecting location for IP:', clientIP || 'auto-detect');

    // Detect location from IP
    const location = await detectLocationFromIP(clientIP);

    console.log('[API] Detected location:', location.country, `(${location.countryCode})`, '→', location.currency);

    return new Response(JSON.stringify(location), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Update for production
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('[API] Location detection error:', error);

    return new Response(
      JSON.stringify({
        currency: 'USD',
        country: 'Unknown',
        countryCode: 'UN',
        error: 'Failed to detect location'
      }),
      {
        status: 200, // Still return 200 with fallback data
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
