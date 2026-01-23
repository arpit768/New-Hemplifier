/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Backend API endpoint for IP-based geolocation
 * This runs on the server to detect user location from IP address
 */

export interface GeoLocationResponse {
  currency: 'NPR' | 'USD';
  country: string;
  countryCode: string;
  city?: string;
  ip?: string;
}

/**
 * Detect user location from IP address (Server-side)
 * Uses ipapi.co API for geolocation
 */
export async function detectLocationFromIP(ipAddress?: string): Promise<GeoLocationResponse> {
  try {
    // If no IP provided, use ipapi's automatic detection
    const url = ipAddress
      ? `https://ipapi.co/${ipAddress}/json/`
      : 'https://ipapi.co/json/';

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Hemplifier-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geolocation API failed: ${response.status}`);
    }

    const data = await response.json();

    // Map country code to currency
    const currency = getCurrencyByCountryCode(data.country_code);

    return {
      currency,
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'UN',
      city: data.city,
      ip: data.ip
    };

  } catch (error) {
    console.error('IP Geolocation failed:', error);

    // Fallback to USD for unknown locations
    return {
      currency: 'USD',
      country: 'Unknown',
      countryCode: 'UN'
    };
  }
}

/**
 * Map country code to currency
 * Nepal (NP) and India (IN) show NPR
 * All other countries show USD
 */
function getCurrencyByCountryCode(countryCode: string): 'NPR' | 'USD' {
  const code = countryCode?.toUpperCase();

  // Nepal uses NPR
  if (code === 'NP') {
    return 'NPR';
  }

  // India also shows NPR (neighboring country, similar market)
  if (code === 'IN') {
    return 'NPR';
  }

  // All other countries default to USD
  return 'USD';
}

/**
 * Extract client IP address from request headers
 * Handles various proxy/CDN scenarios
 */
export function getClientIP(headers: Record<string, string | undefined>): string | undefined {
  // Check common headers that contain client IP
  const candidates = [
    headers['x-forwarded-for'],
    headers['x-real-ip'],
    headers['cf-connecting-ip'], // Cloudflare
    headers['x-client-ip'],
    headers['x-cluster-client-ip']
  ];

  for (const ip of candidates) {
    if (ip) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const firstIP = ip.split(',')[0]?.trim();
      if (firstIP && isValidIP(firstIP)) {
        return firstIP;
      }
    }
  }

  return undefined;
}

/**
 * Basic IP validation
 */
function isValidIP(ip: string): boolean {
  // Simple IPv4 check
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // Simple IPv6 check
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
