/* ============================================================
   EBYG Automation — Content Portal Main Logic
   ============================================================ */

(function () {
    'use strict';

    // ---- State ----
    let currentView = 'dashboard';
    let auditPage = 1;
    const AUDIT_LIMIT = 25;

    // ---- Boot ----

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        // Auth gate
        if (!Auth.requireAuth()) return;

        const user = Auth.getUser();

        // Populate header
        const nameEl = document.getElementById('header-user-name');
        const roleEl = document.getElementById('header-user-role');
        if (nameEl) nameEl.textContent = user ? user.name : 'User';
        if (roleEl) roleEl.textContent = user ? user.role : '';

        // Role-based visibility
        applyRoleVisibility(user);

        // Setup event listeners
        setupNavigation();
        setupLogout();
        setupSidebarToggle();
        setupContentEditors();
        setupReviewQueue();
        setupUsers();
        setupAuditLog();
        setupMediaLibrary();
        setupCharCounters();
        setupVersionToggles();

        // Load dashboard
        await loadDashboard();

        // Hide loader
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(function () { loader.remove(); }, 400);
        }
    }

    // ---- Role-Based Visibility ----

    function applyRoleVisibility(user) {
        const isAdmin = user && user.role === 'admin';
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(function (el) {
            if (!isAdmin) {
                el.style.display = 'none';
            }
        });
    }

    // ---- Navigation ----

    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-view]');
        navItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const view = this.getAttribute('data-view');
                navigateTo(view);

                // Close sidebar on mobile
                const sidebar = document.getElementById('portal-sidebar');
                if (sidebar) sidebar.classList.remove('open');
            });
        });
    }

    function navigateTo(viewName) {
        // Update nav active state
        document.querySelectorAll('.nav-item[data-view]').forEach(function (item) {
            item.classList.toggle('active', item.getAttribute('data-view') === viewName);
        });

        // Show/hide views
        document.querySelectorAll('.view[data-view]').forEach(function (section) {
            section.hidden = section.getAttribute('data-view') !== viewName;
        });

        currentView = viewName;

        // Load data for the view
        switch (viewName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'content-hero':
                loadContent('index', 'hero');
                break;
            case 'content-about':
                loadContent('about', 'about');
                break;
            case 'content-services':
                loadContent('services', 'services');
                break;
            case 'content-gallery':
                loadContent('gallery', 'gallery');
                break;
            case 'content-contact':
                loadContent('contact', 'contact');
                break;
            case 'review-queue':
                loadPendingReviews();
                break;
            case 'users':
                loadUsers();
                break;
            case 'audit-log':
                auditPage = 1;
                loadAuditLog();
                break;
            case 'media-library':
                loadMedia();
                break;
        }
    }

    // ---- Sidebar Toggle (Mobile) ----

    function setupSidebarToggle() {
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('portal-sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', function () {
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function (e) {
                if (sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) &&
                    !toggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    // ---- Logout ----

    function setupLogout() {
        const btn = document.getElementById('logout-btn');
        if (btn) {
            btn.addEventListener('click', function () {
                Auth.logout();
            });
        }
    }

    // ---- Character Counters ----

    function setupCharCounters() {
        const inputs = document.querySelectorAll('input[maxlength], textarea[maxlength]');
        inputs.forEach(function (input) {
            const countId = input.id + '-count';
            const countEl = document.getElementById(countId);
            if (countEl) {
                // Set initial
                countEl.textContent = input.value.length;
                // Listen for changes
                input.addEventListener('input', function () {
                    countEl.textContent = this.value.length;
                });
            }
        });
    }

    // ---- Version History Toggles ----

    function setupVersionToggles() {
        document.querySelectorAll('.version-history-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                this.closest('.version-history').classList.toggle('collapsed');
            });
        });
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    async function loadDashboard() {
        try {
            const data = await Auth.api('GET', '/dashboard');
            document.getElementById('dash-pending').textContent = data.pendingCount || 0;
            document.getElementById('dash-published').textContent = data.publishedToday || 0;
            document.getElementById('dash-areas').textContent = data.contentAreas || 5;
            document.getElementById('dash-users').textContent = data.activeUsers || 0;

            // Update review badge
            updateReviewBadge(data.pendingCount || 0);

            // Recent activity
            renderActivityList(data.recentActivity || []);
        } catch (err) {
            // Dashboard may fail if API isn't up yet — show defaults
            console.warn('Dashboard load failed:', err.message);
        }
    }

    function updateReviewBadge(count) {
        const badge = document.getElementById('review-count-badge');
        if (badge) {
            badge.textContent = count;
            badge.hidden = count === 0;
        }
    }

    function renderActivityList(activities) {
        const container = document.getElementById('activity-list');
        if (!container) return;

        if (!activities.length) {
            container.innerHTML = '<p class="empty-state">No recent activity to display.</p>';
            return;
        }

        const colors = {
            'content.save': '#2563eb',
            'content.submit': '#d97706',
            'content.approve': '#16a34a',
            'content.reject': '#dc2626',
            'content.publish': '#16a34a',
            'user.create': '#8b5cf6',
            'login': '#64748b',
        };

        container.innerHTML = activities.map(function (a) {
            const color = colors[a.action] || '#94a3b8';
            const time = a.timestamp ? formatRelativeTime(a.timestamp) : '';
            return '<div class="activity-item">' +
                '<div class="activity-dot" style="background:' + color + ';"></div>' +
                '<div>' +
                    '<div class="activity-text">' + escapeHtml(a.description || a.action) + '</div>' +
                    '<div class="activity-time">' + escapeHtml(a.userName || '') + (time ? ' — ' + time : '') + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    // ============================================================
    // CONTENT EDITORS
    // ============================================================

    function setupContentEditors() {
        // Save Draft buttons
        document.querySelectorAll('.save-draft-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const form = this.closest('.editor-form');
                if (form) {
                    const page = form.getAttribute('data-page');
                    const area = form.getAttribute('data-area');
                    saveContent(page, area, 'draft');
                }
            });
        });

        // Submit for Review buttons
        document.querySelectorAll('.submit-review-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const form = this.closest('.editor-form');
                if (form) {
                    const page = form.getAttribute('data-page');
                    const area = form.getAttribute('data-area');
                    saveContent(page, area, 'submit');
                }
            });
        });

        // Add Service button
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', function () {
                addRepeatableItem('services');
            });
        }

        // Add Gallery button
        const addGalleryBtn = document.getElementById('add-gallery-btn');
        if (addGalleryBtn) {
            addGalleryBtn.addEventListener('click', function () {
                addRepeatableItem('gallery');
            });
        }
    }

    async function loadContent(page, area) {
        try {
            const data = await Auth.api('GET', '/content/' + page + '/' + area);

            // Populate published reference
            renderPublishedReference(area, data.published || {});

            // Populate form fields
            populateForm(area, data.draft || data.published || {});

            // Load version history
            renderVersionHistory(area, data.versions || []);

        } catch (err) {
            console.warn('Failed to load content for ' + page + '/' + area + ':', err.message);
        }
    }

    function renderPublishedReference(area, published) {
        const refEl = document.getElementById(area + '-ref-content');
        if (!refEl) return;

        const fields = Object.keys(published);
        if (!fields.length) {
            refEl.innerHTML = '<p class="empty-state">No published content yet.</p>';
            return;
        }

        refEl.innerHTML = fields.map(function (key) {
            let value = published[key];
            if (Array.isArray(value)) {
                value = value.length + ' items';
            } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }
            return '<div class="ref-field"><strong>' + escapeHtml(formatFieldName(key)) + '</strong>' + escapeHtml(String(value || '—')) + '</div>';
        }).join('');
    }

    function populateForm(area, data) {
        if (area === 'services') {
            populateRepeatableItems('services', data.items || []);
            return;
        }

        if (area === 'gallery') {
            populateRepeatableItems('gallery', data.items || []);
            return;
        }

        // Simple forms: hero, about, contact
        const form = document.getElementById(area + '-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function (input) {
            const name = input.name;
            if (name && data[name] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = !!data[name];
                } else {
                    input.value = data[name];
                }
                // Update char counter
                const countEl = document.getElementById(input.id + '-count');
                if (countEl) countEl.textContent = input.value.length;
            }
        });
    }

    function populateRepeatableItems(area, items) {
        const container = document.getElementById(area + '-items');
        if (!container) return;
        container.innerHTML = '';

        if (!items.length) {
            // Add one empty item
            addRepeatableItem(area);
            return;
        }

        items.forEach(function (item, index) {
            addRepeatableItem(area, item, index);
        });
    }

    function addRepeatableItem(area, data, index) {
        const container = document.getElementById(area + '-items');
        if (!container) return;

        const idx = index !== undefined ? index : container.children.length;
        const item = document.createElement('div');
        item.className = 'repeatable-item';
        item.setAttribute('data-index', idx);

        if (area === 'services') {
            item.innerHTML =
                '<div class="repeatable-item-header">' +
                    '<span class="repeatable-item-title">Service #' + (idx + 1) + '</span>' +
                    '<button type="button" class="remove-item-btn">Remove</button>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Service Name</label>' +
                    '<input type="text" name="service_name_' + idx + '" maxlength="60" placeholder="Service name" value="' + escapeAttr((data && data.name) || '') + '">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Description</label>' +
                    '<textarea name="service_desc_' + idx + '" maxlength="500" rows="3" placeholder="Service description">' + escapeHtml((data && data.description) || '') + '</textarea>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Display Order</label>' +
                    '<input type="number" name="service_order_' + idx + '" min="0" value="' + ((data && data.display_order) || idx) + '">' +
                '</div>';
        } else if (area === 'gallery') {
            item.innerHTML =
                '<div class="repeatable-item-header">' +
                    '<span class="repeatable-item-title">Gallery Item #' + (idx + 1) + '</span>' +
                    '<button type="button" class="remove-item-btn">Remove</button>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Project Name</label>' +
                    '<input type="text" name="gallery_project_' + idx + '" maxlength="80" placeholder="Project name" value="' + escapeAttr((data && data.project_name) || '') + '">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Caption</label>' +
                    '<input type="text" name="gallery_caption_' + idx + '" maxlength="150" placeholder="Image caption" value="' + escapeAttr((data && data.caption) || '') + '">' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-group">' +
                        '<label>Display Order</label>' +
                        '<input type="number" name="gallery_order_' + idx + '" min="0" value="' + ((data && data.display_order) || idx) + '">' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label>&nbsp;</label>' +
                        '<div class="checkbox-group">' +
                            '<input type="checkbox" name="gallery_visible_' + idx + '" id="gallery_visible_' + idx + '"' + ((data && data.visible !== false) ? ' checked' : '') + '>' +
                            '<label for="gallery_visible_' + idx + '" style="margin-bottom:0;">Visible</label>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        // Wire remove button
        const removeBtn = item.querySelector('.remove-item-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function () {
                item.remove();
                reindexRepeatableItems(area);
            });
        }

        container.appendChild(item);
    }

    function reindexRepeatableItems(area) {
        const container = document.getElementById(area + '-items');
        if (!container) return;
        const items = container.querySelectorAll('.repeatable-item');
        items.forEach(function (item, i) {
            item.setAttribute('data-index', i);
            const title = item.querySelector('.repeatable-item-title');
            if (title) {
                title.textContent = (area === 'services' ? 'Service' : 'Gallery Item') + ' #' + (i + 1);
            }
        });
    }

    function collectFormData(page, area) {
        if (area === 'services') {
            return collectRepeatableData('services');
        }
        if (area === 'gallery') {
            return collectRepeatableData('gallery');
        }

        const form = document.getElementById(area + '-form');
        if (!form) return {};

        const result = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function (input) {
            if (!input.name) return;
            if (input.type === 'checkbox') {
                result[input.name] = input.checked;
            } else {
                result[input.name] = input.value;
            }
        });
        return result;
    }

    function collectRepeatableData(area) {
        const container = document.getElementById(area + '-items');
        if (!container) return { items: [] };

        const items = [];
        container.querySelectorAll('.repeatable-item').forEach(function (itemEl, i) {
            if (area === 'services') {
                items.push({
                    name: (itemEl.querySelector('[name^="service_name_"]') || {}).value || '',
                    description: (itemEl.querySelector('[name^="service_desc_"]') || {}).value || '',
                    display_order: parseInt((itemEl.querySelector('[name^="service_order_"]') || {}).value) || i,
                });
            } else if (area === 'gallery') {
                items.push({
                    project_name: (itemEl.querySelector('[name^="gallery_project_"]') || {}).value || '',
                    caption: (itemEl.querySelector('[name^="gallery_caption_"]') || {}).value || '',
                    display_order: parseInt((itemEl.querySelector('[name^="gallery_order_"]') || {}).value) || i,
                    visible: (itemEl.querySelector('[name^="gallery_visible_"]') || {}).checked !== false,
                });
            }
        });

        return { items: items };
    }

    async function saveContent(page, area, action) {
        const data = collectFormData(page, area);

        // Basic validation
        if (area === 'hero' && !data.headline) {
            showToast('Headline is required.', 'error');
            return;
        }
        if (area === 'about' && !data.heading) {
            showToast('Heading is required.', 'error');
            return;
        }

        try {
            // Save the draft
            const saveResult = await Auth.api('PUT', '/content/' + page + '/' + area, {
                fields: data,
            });

            const snapshotId = saveResult.snapshotId || saveResult.id;

            if (action === 'submit' && snapshotId) {
                // Submit for review
                await Auth.api('POST', '/content/' + page + '/' + area + '/submit', {
                    snapshotId: snapshotId,
                });
                showToast('Content submitted for review.', 'success');
            } else if (action === 'submit') {
                // No snapshot ID but user wanted to submit — try submit directly
                await Auth.api('POST', '/content/' + page + '/' + area + '/submit', {
                    fields: data,
                });
                showToast('Content submitted for review.', 'success');
            } else {
                showToast('Draft saved successfully.', 'success');
            }
        } catch (err) {
            showToast(err.message || 'Failed to save content.', 'error');
        }
    }

    function renderVersionHistory(area, versions) {
        const container = document.getElementById(area + '-versions');
        if (!container) return;

        if (!versions.length) {
            container.innerHTML = '<p class="empty-state">No versions yet.</p>';
            return;
        }

        container.innerHTML = versions.map(function (v) {
            const date = v.createdAt ? formatRelativeTime(v.createdAt) : '';
            return '<div class="version-item">' +
                '<div class="version-meta">' +
                    '<span class="version-author">' + escapeHtml(v.userName || 'Unknown') + '</span>' +
                    '<span class="badge badge-status-' + (v.status || 'pending') + '">' + escapeHtml(v.status || 'draft') + '</span>' +
                '</div>' +
                '<div class="version-date">' + escapeHtml(date) + '</div>' +
                (v.id ? '<button class="version-restore-btn" data-version-id="' + v.id + '" data-area="' + area + '">Restore this version</button>' : '') +
            '</div>';
        }).join('');

        // Wire restore buttons
        container.querySelectorAll('.version-restore-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                restoreVersion(this.getAttribute('data-area'), this.getAttribute('data-version-id'));
            });
        });
    }

    async function restoreVersion(area, versionId) {
        showModal(
            'Restore Version',
            '<p>Are you sure you want to restore this version? Your current draft will be overwritten.</p>',
            async function () {
                try {
                    const data = await Auth.api('POST', '/content/versions/' + versionId + '/restore');
                    if (data.fields) {
                        populateForm(area, data.fields);
                    }
                    showToast('Version restored. Review and save when ready.', 'info');
                } catch (err) {
                    showToast(err.message || 'Failed to restore version.', 'error');
                }
            }
        );
    }

    // ============================================================
    // REVIEW QUEUE
    // ============================================================

    function setupReviewQueue() {
        const refreshBtn = document.getElementById('review-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadPendingReviews);
        }

        const filterStatus = document.getElementById('review-filter-status');
        if (filterStatus) {
            filterStatus.addEventListener('change', loadPendingReviews);
        }
    }

    async function loadPendingReviews() {
        const container = document.getElementById('review-list');
        if (!container) return;

        const statusFilter = (document.getElementById('review-filter-status') || {}).value || 'pending';

        try {
            const data = await Auth.api('GET', '/content/pending' + (statusFilter ? '?status=' + statusFilter : ''));
            const reviews = data.reviews || data.items || [];

            if (!reviews.length) {
                container.innerHTML = '<p class="empty-state">No ' + (statusFilter || '') + ' reviews found.</p>';
                return;
            }

            container.innerHTML = reviews.map(function (r) {
                const statusClass = 'badge-status-' + (r.status || 'pending');
                return '<div class="review-card" data-review-id="' + (r.id || '') + '" data-page="' + (r.page || '') + '" data-area="' + (r.area || '') + '">' +
                    '<div class="review-card-header">' +
                        '<div>' +
                            '<div class="review-card-title">' + escapeHtml((r.page || '') + ' / ' + (r.area || '')) + '</div>' +
                        '</div>' +
                        '<span class="badge ' + statusClass + '">' + escapeHtml(r.status || 'pending') + '</span>' +
                    '</div>' +
                    '<div class="review-card-meta">' +
                        'Submitted by <strong>' + escapeHtml(r.submittedBy || 'Unknown') + '</strong>' +
                        (r.submittedAt ? ' on ' + formatDate(r.submittedAt) : '') +
                    '</div>' +
                    (r.changes ? '<div class="review-card-changes">' + renderChangeSummary(r.changes) + '</div>' : '') +
                    (r.status === 'pending' ?
                        '<div class="review-card-actions">' +
                            '<button class="btn btn-success btn-sm approve-btn">Approve</button>' +
                            '<button class="btn btn-danger btn-sm reject-btn">Reject</button>' +
                        '</div>' : '') +
                '</div>';
            }).join('');

            // Wire approve/reject buttons
            container.querySelectorAll('.approve-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const card = this.closest('.review-card');
                    approveChange(
                        card.getAttribute('data-page'),
                        card.getAttribute('data-area'),
                        card.getAttribute('data-review-id')
                    );
                });
            });

            container.querySelectorAll('.reject-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const card = this.closest('.review-card');
                    rejectChange(
                        card.getAttribute('data-page'),
                        card.getAttribute('data-area'),
                        card.getAttribute('data-review-id')
                    );
                });
            });

        } catch (err) {
            container.innerHTML = '<p class="empty-state">Failed to load reviews.</p>';
            console.warn('Load reviews failed:', err.message);
        }
    }

    function renderChangeSummary(changes) {
        if (typeof changes === 'string') return escapeHtml(changes);
        if (!changes || typeof changes !== 'object') return '';

        return Object.keys(changes).map(function (key) {
            return '<strong>' + escapeHtml(formatFieldName(key)) + ':</strong> ' + escapeHtml(String(changes[key] || ''));
        }).join('<br>');
    }

    async function approveChange(page, area, id) {
        showModal(
            'Approve Change',
            '<p>Approve this content change? It will be published to the staging site.</p>',
            async function () {
                try {
                    await Auth.api('POST', '/content/' + page + '/' + area + '/approve', { id: id });
                    showToast('Change approved and published.', 'success');
                    loadPendingReviews();
                    loadDashboard();
                } catch (err) {
                    showToast(err.message || 'Failed to approve change.', 'error');
                }
            }
        );
    }

    async function rejectChange(page, area, id) {
        showModal(
            'Reject Change',
            '<div class="form-group">' +
                '<label for="reject-notes">Rejection Notes</label>' +
                '<textarea id="reject-notes" rows="3" placeholder="Explain why this change is being rejected&hellip;"></textarea>' +
            '</div>',
            async function () {
                const notes = (document.getElementById('reject-notes') || {}).value || '';
                try {
                    await Auth.api('POST', '/content/' + page + '/' + area + '/reject', { id: id, notes: notes });
                    showToast('Change rejected.', 'info');
                    loadPendingReviews();
                    loadDashboard();
                } catch (err) {
                    showToast(err.message || 'Failed to reject change.', 'error');
                }
            }
        );
    }

    // ============================================================
    // USERS MANAGEMENT
    // ============================================================

    function setupUsers() {
        const createBtn = document.getElementById('create-user-btn');
        if (createBtn) {
            createBtn.addEventListener('click', showCreateUserModal);
        }
    }

    async function loadUsers() {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        try {
            const data = await Auth.api('GET', '/users');
            const users = data.users || data || [];

            if (!users.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found.</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(function (u) {
                const statusClass = u.active !== false ? 'badge-status-active' : 'badge-status-inactive';
                const statusText = u.active !== false ? 'Active' : 'Inactive';
                return '<tr>' +
                    '<td><strong>' + escapeHtml(u.name || '') + '</strong></td>' +
                    '<td>' + escapeHtml(u.email || '') + '</td>' +
                    '<td><span class="badge badge-role">' + escapeHtml(u.role || 'editor') + '</span></td>' +
                    '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '<td>' + (u.lastLogin ? formatDate(u.lastLogin) : 'Never') + '</td>' +
                    '<td class="table-actions">' +
                        '<button class="btn btn-secondary btn-sm edit-user-btn" data-user-id="' + (u.id || '') + '">Edit</button>' +
                        (u.active !== false ?
                            '<button class="btn btn-danger btn-sm deactivate-user-btn" data-user-id="' + (u.id || '') + '">Deactivate</button>' :
                            '<button class="btn btn-success btn-sm activate-user-btn" data-user-id="' + (u.id || '') + '">Activate</button>'
                        ) +
                    '</td>' +
                '</tr>';
            }).join('');

            // Wire edit buttons
            tbody.querySelectorAll('.edit-user-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const userId = this.getAttribute('data-user-id');
                    const user = users.find(function (u) { return String(u.id) === userId; });
                    if (user) showEditUserModal(user);
                });
            });

            // Wire deactivate buttons
            tbody.querySelectorAll('.deactivate-user-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    deactivateUser(this.getAttribute('data-user-id'));
                });
            });

            // Wire activate buttons
            tbody.querySelectorAll('.activate-user-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    activateUser(this.getAttribute('data-user-id'));
                });
            });

        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load users.</td></tr>';
            console.warn('Load users failed:', err.message);
        }
    }

    function showCreateUserModal() {
        showModal(
            'Create User',
            '<div class="form-group">' +
                '<label for="new-user-name">Full Name</label>' +
                '<input type="text" id="new-user-name" placeholder="Full name" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="new-user-email">Email</label>' +
                '<input type="email" id="new-user-email" placeholder="user@example.com" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="new-user-role">Role</label>' +
                '<select id="new-user-role">' +
                    '<option value="editor">Editor</option>' +
                    '<option value="admin">Admin</option>' +
                    '<option value="viewer">Viewer</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="new-user-password">Password</label>' +
                '<input type="password" id="new-user-password" placeholder="Minimum 8 characters" minlength="8" required>' +
            '</div>',
            async function () {
                const name = (document.getElementById('new-user-name') || {}).value || '';
                const email = (document.getElementById('new-user-email') || {}).value || '';
                const role = (document.getElementById('new-user-role') || {}).value || 'editor';
                const password = (document.getElementById('new-user-password') || {}).value || '';

                if (!name || !email || !password) {
                    showToast('All fields are required.', 'error');
                    return;
                }
                if (password.length < 8) {
                    showToast('Password must be at least 8 characters.', 'error');
                    return;
                }

                try {
                    await Auth.api('POST', '/users', { name, email, role, password });
                    showToast('User created successfully.', 'success');
                    loadUsers();
                } catch (err) {
                    showToast(err.message || 'Failed to create user.', 'error');
                }
            }
        );
    }

    function showEditUserModal(user) {
        showModal(
            'Edit User',
            '<div class="form-group">' +
                '<label for="edit-user-name">Full Name</label>' +
                '<input type="text" id="edit-user-name" value="' + escapeAttr(user.name || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="edit-user-email">Email</label>' +
                '<input type="email" id="edit-user-email" value="' + escapeAttr(user.email || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="edit-user-role">Role</label>' +
                '<select id="edit-user-role">' +
                    '<option value="editor"' + (user.role === 'editor' ? ' selected' : '') + '>Editor</option>' +
                    '<option value="admin"' + (user.role === 'admin' ? ' selected' : '') + '>Admin</option>' +
                    '<option value="viewer"' + (user.role === 'viewer' ? ' selected' : '') + '>Viewer</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="edit-user-password">New Password (leave blank to keep current)</label>' +
                '<input type="password" id="edit-user-password" placeholder="Leave blank to keep current">' +
            '</div>',
            async function () {
                const payload = {
                    name: (document.getElementById('edit-user-name') || {}).value || '',
                    email: (document.getElementById('edit-user-email') || {}).value || '',
                    role: (document.getElementById('edit-user-role') || {}).value || 'editor',
                };

                const newPassword = (document.getElementById('edit-user-password') || {}).value || '';
                if (newPassword) {
                    if (newPassword.length < 8) {
                        showToast('Password must be at least 8 characters.', 'error');
                        return;
                    }
                    payload.password = newPassword;
                }

                try {
                    await Auth.api('PUT', '/users/' + user.id, payload);
                    showToast('User updated successfully.', 'success');
                    loadUsers();
                } catch (err) {
                    showToast(err.message || 'Failed to update user.', 'error');
                }
            }
        );
    }

    async function deactivateUser(userId) {
        showModal(
            'Deactivate User',
            '<p>Are you sure you want to deactivate this user? They will no longer be able to log in.</p>',
            async function () {
                try {
                    await Auth.api('DELETE', '/users/' + userId);
                    showToast('User deactivated.', 'success');
                    loadUsers();
                } catch (err) {
                    showToast(err.message || 'Failed to deactivate user.', 'error');
                }
            }
        );
    }

    async function activateUser(userId) {
        try {
            await Auth.api('PUT', '/users/' + userId, { active: true });
            showToast('User activated.', 'success');
            loadUsers();
        } catch (err) {
            showToast(err.message || 'Failed to activate user.', 'error');
        }
    }

    // ============================================================
    // AUDIT LOG
    // ============================================================

    function setupAuditLog() {
        const refreshBtn = document.getElementById('audit-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function () {
                auditPage = 1;
                loadAuditLog();
            });
        }

        const prevBtn = document.getElementById('audit-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                if (auditPage > 1) {
                    auditPage--;
                    loadAuditLog();
                }
            });
        }

        const nextBtn = document.getElementById('audit-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                auditPage++;
                loadAuditLog();
            });
        }

        var searchTimeout;
        var searchInput = document.getElementById('audit-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function () {
                    auditPage = 1;
                    loadAuditLog();
                }, 400);
            });
        }

        var filterAction = document.getElementById('audit-filter-action');
        if (filterAction) {
            filterAction.addEventListener('change', function () {
                auditPage = 1;
                loadAuditLog();
            });
        }
    }

    async function loadAuditLog() {
        const tbody = document.getElementById('audit-tbody');
        if (!tbody) return;

        const search = (document.getElementById('audit-search') || {}).value || '';
        const actionFilter = (document.getElementById('audit-filter-action') || {}).value || '';
        const offset = (auditPage - 1) * AUDIT_LIMIT;

        let queryParams = '?limit=' + AUDIT_LIMIT + '&offset=' + offset;
        if (search) queryParams += '&search=' + encodeURIComponent(search);
        if (actionFilter) queryParams += '&action=' + encodeURIComponent(actionFilter);

        try {
            const data = await Auth.api('GET', '/audit' + queryParams);
            const entries = data.entries || data.items || [];
            const total = data.total || entries.length;

            if (!entries.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No audit entries found.</td></tr>';
            } else {
                tbody.innerHTML = entries.map(function (e) {
                    return '<tr>' +
                        '<td>' + escapeHtml(formatDate(e.timestamp || e.createdAt)) + '</td>' +
                        '<td>' + escapeHtml(e.userName || e.user || '') + '</td>' +
                        '<td>' + escapeHtml(e.action || '') + '</td>' +
                        '<td>' + escapeHtml(e.target || '') + '</td>' +
                        '<td>' + escapeHtml(e.details || '') + '</td>' +
                    '</tr>';
                }).join('');
            }

            // Update pagination
            var pageInfo = document.getElementById('audit-page-info');
            var prevBtn = document.getElementById('audit-prev-btn');
            var nextBtn = document.getElementById('audit-next-btn');

            if (pageInfo) pageInfo.textContent = 'Page ' + auditPage;
            if (prevBtn) prevBtn.disabled = auditPage <= 1;
            if (nextBtn) nextBtn.disabled = entries.length < AUDIT_LIMIT;

        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load audit log.</td></tr>';
            console.warn('Audit log failed:', err.message);
        }
    }

    // ============================================================
    // MEDIA LIBRARY
    // ============================================================

    function setupMediaLibrary() {
        var uploadBtn = document.getElementById('media-upload-btn');
        var fileInput = document.getElementById('media-file-input');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', function () {
                fileInput.click();
            });

            fileInput.addEventListener('change', async function () {
                if (!this.files || !this.files.length) return;
                var file = this.files[0];

                // Validate file size (10 MB max)
                if (file.size > 10 * 1024 * 1024) {
                    showToast('File too large. Maximum size is 10 MB.', 'error');
                    this.value = '';
                    return;
                }

                var formData = new FormData();
                formData.append('file', file);

                try {
                    var token = Auth.getToken();
                    var response = await fetch('/api/media', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                        },
                        body: formData,
                    });

                    if (!response.ok) {
                        var errData = await response.json().catch(function () { return {}; });
                        throw new Error(errData.error || 'Upload failed.');
                    }

                    showToast('File uploaded successfully.', 'success');
                    loadMedia();
                } catch (err) {
                    showToast(err.message || 'Failed to upload file.', 'error');
                }

                this.value = '';
            });
        }
    }

    async function loadMedia() {
        var grid = document.getElementById('media-grid');
        if (!grid) return;

        try {
            var data = await Auth.api('GET', '/media');
            var files = data.files || data.items || [];

            if (!files.length) {
                grid.innerHTML = '<p class="empty-state">No media files uploaded yet.</p>';
                return;
            }

            grid.innerHTML = files.map(function (f) {
                var isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.filename || f.name || '');
                var preview = isImage
                    ? '<img src="' + escapeAttr(f.url || '') + '" alt="' + escapeAttr(f.filename || f.name || '') + '">'
                    : '<span style="font-size:2rem;color:var(--slate-light);">&#128196;</span>';

                return '<div class="media-item">' +
                    '<div class="media-item-preview">' + preview + '</div>' +
                    '<div class="media-item-info">' + escapeHtml(f.filename || f.name || 'Unnamed') + '</div>' +
                '</div>';
            }).join('');
        } catch (err) {
            grid.innerHTML = '<p class="empty-state">Failed to load media library.</p>';
            console.warn('Media load failed:', err.message);
        }
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================

    function showToast(message, type) {
        type = type || 'info';
        var container = document.getElementById('toast-container');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = '<span>' + escapeHtml(message) + '</span><button class="toast-close">&times;</button>';

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function () {
            removeToast(toast);
        });

        // Auto-remove after 5 seconds
        setTimeout(function () {
            removeToast(toast);
        }, 5000);
    }

    function removeToast(toast) {
        if (!toast || toast.classList.contains('removing')) return;
        toast.classList.add('removing');
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }

    // ============================================================
    // MODAL DIALOGS
    // ============================================================

    var modalConfirmCallback = null;

    function showModal(title, bodyHtml, onConfirm, onCancel) {
        var overlay = document.getElementById('modal-overlay');
        var titleEl = document.getElementById('modal-title');
        var bodyEl = document.getElementById('modal-body');
        var confirmBtn = document.getElementById('modal-confirm-btn');
        var cancelBtn = document.getElementById('modal-cancel-btn');
        var closeBtn = document.getElementById('modal-close-btn');

        if (!overlay) return;

        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHtml;
        overlay.hidden = false;

        // Clean up previous listeners by cloning buttons
        var newConfirm = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
        var newCancel = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
        var newClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newClose, closeBtn);

        function closeModal() {
            overlay.hidden = true;
            bodyEl.innerHTML = '';
        }

        newConfirm.addEventListener('click', async function () {
            if (typeof onConfirm === 'function') {
                newConfirm.disabled = true;
                try {
                    await onConfirm();
                } catch (e) {
                    // error handled in callback
                }
                newConfirm.disabled = false;
            }
            closeModal();
        });

        newCancel.addEventListener('click', function () {
            if (typeof onCancel === 'function') onCancel();
            closeModal();
        });

        newClose.addEventListener('click', function () {
            if (typeof onCancel === 'function') onCancel();
            closeModal();
        });

        // Close on overlay click
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                if (typeof onCancel === 'function') onCancel();
                closeModal();
            }
        });
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(str)));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function formatFieldName(name) {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            var d = new Date(dateStr);
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        } catch (e) {
            return dateStr;
        }
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        try {
            var d = new Date(dateStr);
            var now = new Date();
            var diffMs = now - d;
            var diffSec = Math.floor(diffMs / 1000);
            var diffMin = Math.floor(diffSec / 60);
            var diffHr = Math.floor(diffMin / 60);
            var diffDay = Math.floor(diffHr / 24);

            if (diffSec < 60) return 'just now';
            if (diffMin < 60) return diffMin + ' min ago';
            if (diffHr < 24) return diffHr + 'h ago';
            if (diffDay < 7) return diffDay + 'd ago';
            return formatDate(dateStr);
        } catch (e) {
            return dateStr;
        }
    }

})();
