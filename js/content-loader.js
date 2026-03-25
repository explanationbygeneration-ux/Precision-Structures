/**
 * Content Loader — fetches published CMS content and injects it into the page.
 *
 * How it works:
 *   1. Detects the current page from the filename (e.g. "index.html")
 *   2. Fetches published content from /api/content/public/{page}
 *   3. Finds elements with data-cms-field="fieldName" attributes
 *   4. Updates their text content (or href for links)
 *   5. If the API is unavailable or returns no content, the hardcoded HTML stays as-is
 *
 * Usage: add data-cms-field="fieldName" to any element you want to be editable.
 * The fieldName must match what the admin portal saves in field_values.
 */
(function () {
    'use strict';

    // Determine current page filename
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (page === '' || page === '/') page = 'index.html';

    // Only run on pages that have CMS content
    var cmsPages = ['index.html', 'about.html', 'services.html', 'contact.html'];
    if (cmsPages.indexOf(page) === -1) return;

    // Fetch and apply
    fetch('/api/content/public/' + encodeURIComponent(page))
        .then(function (response) {
            if (!response.ok) throw new Error('API error');
            return response.json();
        })
        .then(function (data) {
            var areas = data.areas || {};

            // For each area that has published content, apply field values
            Object.keys(areas).forEach(function (area) {
                var fields = areas[area];
                if (!fields || typeof fields !== 'object') return;

                Object.keys(fields).forEach(function (fieldName) {
                    var value = fields[fieldName];
                    if (value === null || value === undefined) return;

                    // Find all elements matching this field
                    var selector = '[data-cms-field="' + fieldName + '"]';
                    var elements = document.querySelectorAll(selector);

                    elements.forEach(function (el) {
                        applyFieldValue(el, fieldName, value);
                    });
                });
            });
        })
        .catch(function () {
            // API unavailable — silently keep hardcoded content
        });

    /**
     * Apply a CMS field value to a DOM element.
     * Handles text, links, and multi-line content.
     */
    function applyFieldValue(el, fieldName, value) {
        // For link fields (field name ends with _link or _url), update href
        if (/_link$|_url$/.test(fieldName)) {
            if (el.tagName === 'A') {
                el.setAttribute('href', value);
            }
            return;
        }

        // For email fields, update both text and href
        if (/_email$/.test(fieldName)) {
            if (el.tagName === 'A') {
                el.textContent = value;
                el.setAttribute('href', 'mailto:' + value);
            } else {
                el.textContent = value;
            }
            return;
        }

        // For phone fields, update text and tel: href
        if (fieldName === 'phone') {
            var digits = value.replace(/\D/g, '');
            if (el.tagName === 'A') {
                el.textContent = value;
                el.setAttribute('href', 'tel:' + digits);
            } else {
                el.textContent = value;
            }
            return;
        }

        // For body/multi-line text, check if value contains line breaks
        if (fieldName === 'body' || fieldName === 'description') {
            // If the value looks like it has paragraphs, set innerHTML with basic sanitization
            if (value.indexOf('\n\n') !== -1) {
                var paragraphs = value.split('\n\n').map(function (p) {
                    return '<p>' + escapeHtml(p.trim()) + '</p>';
                }).join('');
                el.innerHTML = paragraphs;
            } else {
                el.textContent = value;
            }
            return;
        }

        // Default: set text content
        el.textContent = value;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
})();
