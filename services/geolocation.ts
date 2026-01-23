/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface GeolocationData {
  currency: 'NPR' | 'USD';
  country: string;
  countryCode: string;
  city?: string;
}

/**
 * Detect user's location and currency based on IP address
 * This calls the BACKEND API which handles IP detection server-side
 * Backend location: /api/geolocation.ts
 */
export async function detectLocationAndCurrency(): Promise<{ currency: 'NPR' | 'USD', country: string }> {
  try {
    console.log('[Frontend] Requesting location detection from backend...');

    // In production, this would call your backend API
    // For now, we'll use ipapi.co directly but the backend endpoint is ready

    // TODO: When deploying, change this to your backend URL:
    // const response = await fetch('/api/location');

    // For development, call ipapi directly (will be replaced with backend in production)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch geolocation');
    }

    const data = await response.json();

    // Map the response
    const countryCode = data.country_code || data.countryCode;
    const countryName = data.country_name || data.country;

    console.log('[Frontend] Detected location:', countryName, `(${countryCode})`);

    // Determine currency based on country
    const currency = getCurrencyByCountry(countryCode);

    console.log('[Frontend] Currency set to:', currency);

    return {
      currency,
      country: countryName || 'Unknown'
    };
  } catch (error) {
    console.error('[Frontend] Geolocation detection failed:', error);

    // Fallback: Try to detect timezone-based location
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('[Frontend] Using timezone fallback:', timezone);

      // Nepal timezone is Asia/Kathmandu
      if (timezone.includes('Kathmandu') || timezone.includes('Asia/Calcutta')) {
        return { currency: 'NPR', country: 'Nepal' };
      }
    } catch (tzError) {
      console.error('[Frontend] Timezone detection failed:', tzError);
    }

    // Ultimate fallback: USD
    console.log('[Frontend] Using default currency: USD');
    return { currency: 'USD', country: 'Unknown' };
  }
}

/**
 * Map country code to currency
 * Nepal (NP) → NPR
 * India (IN) → NPR
 * All others → USD
 */
function getCurrencyByCountry(countryCode: string): 'NPR' | 'USD' {
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
 * Detect user's country for analytics (non-blocking)
 */
export async function getCountryCode(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/country/', {
      method: 'GET'
    });

    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('[Frontend] Country detection failed:', error);
  }

  return 'UNKNOWN';
}
