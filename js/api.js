/* =============================================
   CodeRescue AI — API Integration Layer
   Connects frontend features to AWS Lambda + Bedrock
   Falls back to hardcoded responses if API is unavailable
   ============================================= */

const API_CONFIG = {
    // ⚡ REPLACE THIS with your actual API Gateway endpoint after deployment
    endpoint: '', // e.g. 'https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/rescue'
    timeout: 15000, // 15 second timeout
    enabled: false, // Set to true after deploying backend
};

/**
 * Call the CodeRescue AI backend API
 * @param {string} feature - Feature identifier (chat, dependency, ancestry, etc.)
 * @param {string} input - User input text
 * @param {object} metadata - Additional context (varies per feature)
 * @returns {Promise<{response: any, structured: boolean, fromAPI: boolean}>}
 */
async function callRescueAPI(feature, input, metadata = {}) {
    if (!API_CONFIG.enabled || !API_CONFIG.endpoint) {
        return { response: null, structured: false, fromAPI: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        const res = await fetch(API_CONFIG.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature, input, metadata }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            console.warn(`API returned ${res.status}`);
            return { response: null, structured: false, fromAPI: false };
        }

        const data = await res.json();

        if (data.error || data.fallback) {
            return { response: null, structured: false, fromAPI: false };
        }

        return {
            response: data.response,
            structured: data.structured,
            fromAPI: true,
            model: data.model,
        };
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.warn('API request timed out, using fallback');
        } else {
            console.warn('API unavailable, using fallback:', err.message);
        }
        return { response: null, structured: false, fromAPI: false };
    }
}

/**
 * Check if the API is configured and reachable
 */
async function checkAPIHealth() {
    if (!API_CONFIG.endpoint) return false;
    try {
        const res = await fetch(API_CONFIG.endpoint, {
            method: 'OPTIONS',
            signal: AbortSignal.timeout(5000),
        });
        API_CONFIG.enabled = res.ok;
        return res.ok;
    } catch {
        API_CONFIG.enabled = false;
        return false;
    }
}

// Auto-check API health on load (non-blocking)
if (API_CONFIG.endpoint) {
    checkAPIHealth().then(ok => {
        if (ok) console.log('✅ CodeRescue API connected:', API_CONFIG.endpoint);
        else console.log('⚠️ API not reachable, using local fallbacks');
    });
}
