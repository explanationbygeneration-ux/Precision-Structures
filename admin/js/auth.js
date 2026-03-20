/* ============================================================
   EBYG Automation — Authentication Module
   ============================================================ */

const Auth = (function () {
    'use strict';

    const TOKEN_KEY = 'ebyg_token';
    const USER_KEY = 'ebyg_user';
    const API_BASE = '/api';

    // ---- Token helpers ----

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    }

    function getUser() {
        try {
            const raw = sessionStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setUser(user) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function clearSession() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    }

    /**
     * Decode JWT payload (without verification — we only use this
     * client-side to check expiry and read claims).
     */
    function decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = parts[1];
            // Base64url → Base64
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }

    /**
     * Check whether the stored token exists and has not expired.
     */
    function isLoggedIn() {
        const token = getToken();
        if (!token) return false;

        const payload = decodeJWT(token);
        if (!payload) return false;

        // If there's an exp claim, check it (with 30s buffer)
        if (payload.exp) {
            const nowSec = Math.floor(Date.now() / 1000);
            if (payload.exp < nowSec - 30) {
                clearSession();
                return false;
            }
        }
        return true;
    }

    // ---- API Wrapper ----

    let isRefreshing = false;
    let refreshPromise = null;

    /**
     * Authenticated fetch wrapper.
     * Automatically attaches Authorization header and handles 401 refresh logic.
     *
     * @param {string} method   HTTP method
     * @param {string} endpoint API path (e.g. '/auth/login')
     * @param {*}      body     Request body (will be JSON-serialized)
     * @param {object} opts     Extra options
     * @returns {Promise<object>} Parsed JSON response
     */
    async function api(method, endpoint, body, opts = {}) {
        const url = API_BASE + endpoint;
        const headers = {
            'Content-Type': 'application/json',
        };

        const token = getToken();
        if (token && !opts.noAuth) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        const fetchOpts = {
            method: method.toUpperCase(),
            headers: headers,
        };

        if (body !== undefined && body !== null && method.toUpperCase() !== 'GET') {
            fetchOpts.body = JSON.stringify(body);
        }

        let response;
        try {
            response = await fetch(url, fetchOpts);
        } catch (networkErr) {
            throw new Error('Network error. Please check your connection and try again.');
        }

        // Handle 401 — attempt token refresh once
        if (response.status === 401 && !opts.noAuth && !opts._isRetry) {
            try {
                await refreshToken();
                // Retry original request with new token
                return api(method, endpoint, body, { ...opts, _isRetry: true });
            } catch (refreshErr) {
                clearSession();
                window.location.href = 'index.html';
                throw new Error('Session expired. Please log in again.');
            }
        }

        // Parse response
        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text };
        }

        if (!response.ok) {
            const errMsg = data.error || data.message || 'Request failed (' + response.status + ')';
            const err = new Error(errMsg);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    }

    // ---- Auth Actions ----

    /**
     * Log in with email and password.
     */
    async function login(email, password) {
        const data = await api('POST', '/auth/login', { email, password }, { noAuth: true });

        if (!data.token) {
            throw new Error('Invalid response from server.');
        }

        setToken(data.token);
        setUser(data.user || extractUserFromToken(data.token));

        return data;
    }

    /**
     * Log out — clear session and redirect.
     */
    function logout() {
        // Fire-and-forget server-side logout
        try {
            api('POST', '/auth/logout', null).catch(function () {});
        } catch (e) {
            // ignore
        }
        clearSession();
        window.location.href = 'index.html';
    }

    /**
     * Refresh the access token.
     */
    async function refreshToken() {
        // Deduplicate concurrent refresh calls
        if (isRefreshing && refreshPromise) {
            return refreshPromise;
        }

        isRefreshing = true;
        refreshPromise = (async function () {
            try {
                const data = await api('POST', '/auth/refresh', null, { noAuth: false, _isRetry: true });
                if (data.token) {
                    setToken(data.token);
                    if (data.user) {
                        setUser(data.user);
                    }
                }
                return data;
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    }

    /**
     * First-time setup — create the initial admin account.
     */
    async function setup(name, email, password) {
        const data = await api('POST', '/setup', { name, email, password }, { noAuth: true });

        if (data.token) {
            setToken(data.token);
            setUser(data.user || extractUserFromToken(data.token));
        }

        return data;
    }

    /**
     * Extract basic user info from a JWT token payload.
     */
    function extractUserFromToken(token) {
        const payload = decodeJWT(token);
        if (!payload) return { name: 'User', role: 'editor' };
        return {
            id: payload.sub || payload.id,
            name: payload.name || 'User',
            email: payload.email || '',
            role: payload.role || 'editor',
        };
    }

    // ---- Guards ----

    /**
     * Redirect to login if not authenticated.
     * Call this at the top of protected pages.
     */
    function requireAuth() {
        if (!isLoggedIn()) {
            clearSession();
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    /**
     * Check if the current user has the required role.
     * Role hierarchy: admin > editor > viewer
     */
    function requireRole(requiredRole) {
        const user = getUser();
        if (!user) return false;

        const hierarchy = { viewer: 1, editor: 2, admin: 3 };
        const userLevel = hierarchy[user.role] || 0;
        const requiredLevel = hierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    // ---- Public API ----

    return {
        getToken: getToken,
        getUser: getUser,
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        refreshToken: refreshToken,
        setup: setup,
        requireAuth: requireAuth,
        requireRole: requireRole,
        api: api,
    };
})();
