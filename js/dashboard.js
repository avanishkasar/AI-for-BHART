/* =============================================
   CodeRescue AI — Dashboard JavaScript
   Panic button, triage, chat, activity feed
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    initPanicButton();
    initChat();
    initSuggestionChips();
    initQuickActions();
    startActivitySimulation();
    updateCounters();
    initTabs();
    initDependencyAnalyzer();
    initAncestryTree();
    initContextCapsule();
    initQuietMentor();
    initCommitRisk();
    initPostMortem();
    initRubberDuck();
    initChatHeaderActions();
    initKBSearch();
    initLanguageSelector();
});

/* ── State ── */
const state = {
    incidents: [],
    messages: [],
    isTriaging: false,
    resolvedCount: 14,
    activeCount: 0,
};

/* ── Panic Button ── */
function initPanicButton() {
    const btn = document.getElementById('panicButton');
    const card = btn?.closest('.panic-card');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (state.isTriaging) return;
        
        card.classList.add('panic-active');
        state.isTriaging = true;
        
        addActivity('🚨 Panic button pressed — initiating triage');
        startTriage();
        
        setTimeout(() => {
            card.classList.remove('panic-active');
        }, 3000);
    });
}

/* ── Triage Process ── */
function startTriage() {
    const overlay = document.getElementById('triageOverlay');
    const progressBar = document.getElementById('triageProgressBar');
    const steps = document.querySelectorAll('.triage-step');
    const result = document.getElementById('triageResult');
    const stepsContainer = document.getElementById('triageSteps');
    
    // Reset
    overlay.classList.add('active');
    progressBar.style.width = '0%';
    steps.forEach(s => {
        s.classList.remove('active', 'done');
        s.querySelector('.triage-step-status').textContent = '⏳';
    });
    result.style.display = 'none';
    stepsContainer.style.display = 'block';
    
    const severities = [
        { level: 'P3', label: 'LOW', color: 'var(--p3-color)', msg: 'Simple question detected. AI bot can resolve this instantly.' },
        { level: 'P2', label: 'MEDIUM', color: 'var(--p2-color)', msg: 'Bug detected. AI attempting resolution, expert on standby.' },
        { level: 'P4', label: 'LEARNING', color: 'var(--p4-color)', msg: 'Learning question detected. AI tutor ready with personalized guidance.' },
        { level: 'P1', label: 'HIGH', color: 'var(--p1-color)', msg: 'Complex issue detected. Routing to available expert.' },
    ];
    
    const chosen = severities[Math.floor(Math.random() * severities.length)];
    
    // Step through triage
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
        if (stepIndex > 0) {
            steps[stepIndex - 1].classList.remove('active');
            steps[stepIndex - 1].classList.add('done');
            steps[stepIndex - 1].querySelector('.triage-step-status').textContent = '✅';
        }
        
        if (stepIndex < steps.length) {
            steps[stepIndex].classList.add('active');
            steps[stepIndex].querySelector('.triage-step-status').textContent = '⚙️';
            progressBar.style.width = ((stepIndex + 1) / steps.length * 100) + '%';
            stepIndex++;
        } else {
            clearInterval(stepInterval);
            
            // Show result
            setTimeout(() => {
                stepsContainer.style.display = 'none';
                result.style.display = 'block';
                
                const severityEl = document.getElementById('triageSeverity');
                const messageEl = document.getElementById('triageMessage');
                
                severityEl.style.color = chosen.color;
                severityEl.textContent = `${chosen.level} — ${chosen.label}`;
                messageEl.textContent = chosen.msg;
                
                addActivity(`🏷️ Triage complete: ${chosen.level} ${chosen.label}`);
                
                // Add incident
                addIncident(chosen);
            }, 400);
        }
    }, 1200);
    
    // Continue button
    const continueBtn = document.getElementById('triageContinue');
    continueBtn.onclick = () => {
        overlay.classList.remove('active');
        state.isTriaging = false;
        
        // Auto-send a message from AI
        clearChat();
        addMessage('ai', `🏷️ **Severity: ${chosen.level} (${chosen.label})**\n\n${chosen.msg}\n\nI've captured your context and I'm ready to help. Can you describe the issue you're facing? Or paste the error message below.`);
        addActivity('🤖 AI assistant engaged');
    };
}

/* ── Chat System ── */
function initChat() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (!input || !sendBtn) return;
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    
    // Send on Enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    // Clear welcome screen if present
    const welcome = document.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
    
    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    
    addActivity(`💬 User: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);
    
    // Show typing indicator then respond
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        const response = generateAIResponse(text);
        addMessage('ai', response);
        addActivity('🤖 AI response generated');
        
        state.resolvedCount++;
        updateCounters();
    }, 1500 + Math.random() * 1500);
}

function addMessage(type, content) {
    const container = document.getElementById('chatMessages');
    
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = `msg-avatar ${type === 'ai' ? 'ai' : 'human'}`;
    avatar.textContent = type === 'ai' ? '🤖' : '👤';
    
    const contentEl = document.createElement('div');
    contentEl.className = 'msg-content';
    contentEl.innerHTML = formatMessage(content);
    
    const timeEl = document.createElement('div');
    timeEl.className = 'msg-time';
    timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    contentEl.appendChild(timeEl);
    
    msgEl.appendChild(avatar);
    msgEl.appendChild(contentEl);
    container.appendChild(msgEl);
    
    container.scrollTop = container.scrollHeight;
}

function formatMessage(text) {
    // Simple markdown-like formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'chat-message ai';
    typing.id = 'typingIndicator';
    
    typing.innerHTML = `
        <div class="msg-avatar ai">🤖</div>
        <div class="msg-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

function clearChat() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
}

/* ── AI Response Generator ── */
function generateAIResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('typeerror') || lower.includes('type error')) {
        return `**🔍 TypeError Detected**\n\nBased on the context I captured, here's what's happening:\n\nThe error occurs because you're trying to access a property on \`undefined\`. This commonly happens when:\n\n1. An API response doesn't have the expected structure\n2. A state variable hasn't been initialized\n3. An async operation hasn't completed yet\n\n**Quick Fix:**\n\`\`\`javascript\n// Add optional chaining\nconst value = data?.property?.nested ?? 'default';\n\`\`\`\n\n**Prevention:** Always validate data before accessing nested properties. Would you like me to review the specific file?`;
    }
    
    if (lower.includes('500') || lower.includes('api') || lower.includes('endpoint') || lower.includes('server')) {
        return `**🔍 Server Error Analysis**\n\nA 500 error means something went wrong on the server side. Let me help you debug:\n\n**Common causes:**\n1. Unhandled exception in route handler\n2. Database connection timeout\n3. Missing environment variables\n4. Malformed request body\n\n**Debugging steps:**\n\`\`\`bash\n# Check server logs\ntail -f logs/error.log\n\n# Test endpoint directly\ncurl -X POST http://localhost:3000/api/endpoint \\\n  -H "Content-Type: application/json" \\\n  -d '{"test": true}'\n\`\`\`\n\nWould you like me to analyze your server logs or route handler code?`;
    }
    
    if (lower.includes('async') || lower.includes('await') || lower.includes('promise')) {
        return `**📖 Async/Await Guide**\n\nGreat question! Here's how async/await works in JavaScript:\n\n**Key Concepts:**\n\n1. **\`async\`** — Declares a function returns a Promise\n2. **\`await\`** — Pauses execution until Promise resolves\n3. **Error handling** — Use try/catch with async/await\n\n**Example:**\n\`\`\`javascript\nasync function fetchUserData(userId) {\n  try {\n    const response = await fetch(\`/api/users/\${userId}\`);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to fetch:', error);\n    throw error;\n  }\n}\n\`\`\`\n\n**Common Pitfall:** Don't forget to \`await\` async calls — without it you get a Promise object instead of the value!\n\nWant me to explain more about Promise chaining or error handling patterns?`;
    }
    
    if (lower.includes('slow') || lower.includes('performance') || lower.includes('database') || lower.includes('query')) {
        return `**⚡ Performance Analysis**\n\nSlow database queries are a common bottleneck. Here's my diagnostic approach:\n\n**Quick Wins:**\n1. **Add indexes** on frequently queried columns\n2. **Avoid N+1 queries** — use eager loading/joins\n3. **Implement pagination** — never fetch all records\n4. **Cache frequent queries** with Redis\n\n**Diagnostic Query:**\n\`\`\`sql\nEXPLAIN ANALYZE SELECT * FROM users \nWHERE status = 'active' \nORDER BY created_at DESC;\n\`\`\`\n\nThis will show you the query execution plan and where time is being spent.\n\nWould you like me to analyze your specific query or suggest an indexing strategy?`;
    }
    
    if (lower.includes('cors')) {
        return `**🔧 CORS Fix**\n\nCORS errors happen when the browser blocks requests to a different origin. Here's the fix:\n\n**For Express.js:**\n\`\`\`javascript\nconst cors = require('cors');\n\napp.use(cors({\n  origin: 'http://localhost:3000',\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true\n}));\n\`\`\`\n\n**Key points:**\n- Set the \`origin\` to your frontend URL\n- Include \`credentials: true\` if using cookies\n- Add all HTTP methods your API uses\n\n✅ Solution auto-documented in knowledge base.`;
    }
    
    // Generic response
    return `**🤖 Analyzing your issue...**\n\nI've processed your description. Here's my analysis:\n\n**Severity Assessment:** This appears to be a P3 (Low) issue that I can help resolve.\n\n**What I found:**\n- The issue is likely related to a configuration or logic error\n- Similar issues have been resolved ${Math.floor(Math.random() * 50 + 10)} times in our knowledge base\n\n**Recommended next steps:**\n1. Share the exact error message or stack trace\n2. Paste the relevant code snippet\n3. Tell me what you expected vs. what happened\n\nThe more context you provide, the faster I can pinpoint the root cause. You can also use the **📋 Paste Error Log** quick action on the left.\n\n💡 *Tip: Hit the panic button for automatic context capture from your IDE!*`;
}

/* ── Suggestion Chips ── */
function initSuggestionChips() {
    // Only target chat suggestion chips (those with data-msg), not dep/cr/duck chips
    document.querySelectorAll('.welcome-suggestions .suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const msg = chip.dataset.msg;
            if (!msg) return;
            const input = document.getElementById('chatInput');
            input.value = msg;
            sendMessage();
        });
    });
}

/* ── Quick Actions ── */
function initQuickActions() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch(action) {
                case 'paste-error':
                    const input = document.getElementById('chatInput');
                    input.focus();
                    input.placeholder = 'Paste your error log here...';
                    addActivity('📋 Error log paste mode activated');
                    break;
                case 'upload-code':
                    addActivity('📁 File upload initiated');
                    showToast('File upload feature — attach code files for analysis');
                    break;
                case 'voice-call':
                    addActivity('🎙️ Voice call requested');
                    showToast('Voice call connecting... (demo mode)');
                    break;
                case 'screen-share':
                    addActivity('🖥️ Screen share requested');
                    showToast('Screen sharing initiated... (demo mode)');
                    break;
            }
        });
    });
}

/* ── Incident Management ── */
function addIncident(severity) {
    const incident = {
        id: Date.now(),
        severity: severity.level,
        label: severity.label,
        title: getIncidentTitle(severity.level),
        time: new Date()
    };
    
    state.incidents.unshift(incident);
    state.activeCount = state.incidents.length;
    updateCounters();
    renderIncidents();
}

function getIncidentTitle(level) {
    const titles = {
        'P0': 'Production service down',
        'P1': 'Memory leak in server',
        'P2': 'CORS error blocking API',
        'P3': 'TypeError in component',
        'P4': 'Learning: async/await'
    };
    return titles[level] || 'Issue detected';
}

function renderIncidents() {
    const list = document.getElementById('incidentsList');
    const badge = document.getElementById('incidentBadge');
    
    if (state.incidents.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span>✅</span>
                <p>No active incidents</p>
            </div>
        `;
        badge.textContent = '0';
        return;
    }
    
    badge.textContent = state.incidents.length;
    list.innerHTML = state.incidents.map(inc => `
        <div class="incident-item">
            <span class="incident-severity ${inc.severity.toLowerCase()}">${inc.severity}</span>
            <div class="incident-info">
                <div class="incident-title">${inc.title}</div>
                <div class="incident-time">${formatTime(inc.time)}</div>
            </div>
        </div>
    `).join('');
}

/* ── Activity Feed ── */
function addActivity(text) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <span class="activity-dot"></span>
        <span>${text}</span>
        <span class="activity-time">${formatTime(new Date())}</span>
    `;
    
    feed.insertBefore(item, feed.firstChild);
    
    // Keep max 20 items
    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

function startActivitySimulation() {
    const activities = [
        '🧠 AI model health check — OK',
        '📚 Knowledge base synced — 1,247 solutions',
        '🌐 Translation service online',
        '⚡ Average response time: 4.2s',
        '📊 Daily: 89 issues resolved',
        '🔄 System health: optimal',
    ];
    
    let i = 0;
    setInterval(() => {
        addActivity(activities[i % activities.length]);
        i++;
    }, 15000);
}

/* ── Counter Animations ── */
function updateCounters() {
    const activeEl = document.getElementById('activeCount');
    const resolvedEl = document.getElementById('resolvedCount');
    
    if (activeEl) animateCounter(activeEl, state.activeCount);
    if (resolvedEl) animateCounter(resolvedEl, state.resolvedCount);
}

function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    const diff = target - current;
    const steps = 20;
    const increment = diff / steps;
    let step = 0;
    
    const interval = setInterval(() => {
        step++;
        element.textContent = Math.round(current + increment * step);
        if (step >= steps) {
            element.textContent = target;
            clearInterval(interval);
        }
    }, 30);
}

/* ── Toast Notification ── */
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 14px 24px;
        color: #f0f0f5;
        font-size: 0.9rem;
        font-family: 'Inter', sans-serif;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ── Utility ── */
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ==============================================
   NEW FEATURES — Tab Switching, Dep Danger,
   Error Ancestry, Context Capsule, Quiet Mentor
   ============================================== */

/* ── Tab Switching ── */
function initTabs() {
    document.querySelectorAll('.dash-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panelId = 'tab-' + tab.dataset.tab;
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.add('active');
        });
    });
}

/* ── Dependency Danger Score ── */
const depDatabase = {
    'moment': {
        score: 72, lastCommit: '14 months ago', cves: 3, busFactor: 2,
        weeklyDownloads: '12M', abandoned: true, modern: 'date-fns or Day.js',
        reason: 'Mutable API, huge bundle size (67KB gzipped). The community has moved to lighter alternatives. Tree-shaking is also impossible.'
    },
    'left-pad': {
        score: 95, lastCommit: '8 years ago', cves: 0, busFactor: 1,
        weeklyDownloads: '3M', abandoned: true, modern: 'String.prototype.padStart()',
        reason: 'Unpublished from npm in 2016, breaking thousands of packages. Its 11-line functionality is now native in JavaScript ES2017.'
    },
    'lodash': {
        score: 18, lastCommit: '6 months ago', cves: 1, busFactor: 5,
        weeklyDownloads: '45M', abandoned: false, modern: null,
        reason: 'Still widely maintained. Consider importing individual methods (lodash/get) for better tree-shaking instead of the full bundle.'
    },
    'request': {
        score: 88, lastCommit: '4 years ago', cves: 5, busFactor: 1,
        weeklyDownloads: '18M', abandoned: true, modern: 'axios or native fetch()',
        reason: 'Officially deprecated by maintainers in 2020. No longer receiving security patches. High CVE count.'
    },
    'colors': {
        score: 82, lastCommit: '3 years ago', cves: 2, busFactor: 1,
        weeklyDownloads: '8M', abandoned: true, modern: 'chalk or kleur',
        reason: 'In January 2022 the maintainer intentionally corrupted the package with an infinite loop as a protest. Community forked to "colors.js".'
    },
    'faker': {
        score: 35, lastCommit: '2 months ago', cves: 0, busFactor: 8,
        weeklyDownloads: '3.5M', abandoned: false, modern: null,
        reason: 'Community fork after the original maintainer deleted the repo. Actively maintained with a large contributor base — relatively safe.'
    },
};

function initDependencyAnalyzer() {
    const btn = document.getElementById('depAnalyzeBtn');
    const input = document.getElementById('depInput');

    document.querySelectorAll('.dep-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            input.value = chip.dataset.pkg;
            analyzeDependency(chip.dataset.pkg);
        });
    });

    btn?.addEventListener('click', () => analyzeDependency(input.value.trim()));

    input?.addEventListener('keydown', e => {
        if (e.key === 'Enter') analyzeDependency(input.value.trim());
    });
}

function analyzeDependency(pkg) {
    if (!pkg) { showToast('Enter a package name first'); return; }

    const result = document.getElementById('depResult');
    const data = depDatabase[pkg.toLowerCase()] || {
        score: Math.floor(Math.random() * 50) + 15,
        lastCommit: (Math.floor(Math.random() * 12) + 1) + ' months ago',
        cves: Math.floor(Math.random() * 3),
        busFactor: Math.floor(Math.random() * 5) + 1,
        weeklyDownloads: (Math.random() * 8 + 0.5).toFixed(1) + 'M',
        abandoned: Math.random() > 0.6,
        modern: null,
        reason: 'Package analyzed. No entry in our known-risk database — monitor regularly for CVEs and abandoned status.',
    };

    result.style.display = 'flex';

    const scoreColor = data.score >= 75 ? '#ff3b5c' : data.score >= 50 ? '#ffcc00' : '#00e676';
    const verdict = data.score >= 75 ? '⚠️ Risky' : data.score >= 50 ? '⚡ Caution' : '✅ Safe';
    const circumference = 314;
    const offset = circumference - (data.score / 100) * circumference;

    const circle = document.getElementById('dangerRingCircle');
    circle.style.stroke = scoreColor;
    circle.style.strokeDashoffset = circumference;
    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
        circle.style.strokeDashoffset = offset;
    }, 80);

    document.getElementById('dangerScoreNum').textContent = data.score;
    document.getElementById('dangerScoreNum').style.color = scoreColor;
    document.getElementById('dangerScoreVerdict').textContent = verdict;
    document.getElementById('dangerScoreVerdict').style.color = scoreColor;

    const cveSeverity = data.cves >= 4 ? 'critical' : data.cves >= 2 ? 'danger' : data.cves >= 1 ? 'warning' : 'safe';
    const commitSeverity = parseInt(data.lastCommit) > 12 ? 'danger' : parseInt(data.lastCommit) > 6 ? 'warning' : 'safe';
    const abandonSeverity = data.abandoned ? 'critical' : 'safe';

    document.getElementById('depMetrics').innerHTML = `
        <div class="dep-metric ${commitSeverity}">
            <div class="dep-metric-icon">📅</div>
            <div class="dep-metric-info">
                <div class="dep-metric-label">Last Commit</div>
                <div class="dep-metric-value">${data.lastCommit}</div>
            </div>
        </div>
        <div class="dep-metric ${cveSeverity}">
            <div class="dep-metric-icon">🔐</div>
            <div class="dep-metric-info">
                <div class="dep-metric-label">Known CVEs</div>
                <div class="dep-metric-value">${data.cves} vulnerabilit${data.cves !== 1 ? 'ies' : 'y'}</div>
            </div>
        </div>
        <div class="dep-metric ${data.busFactor <= 2 ? 'warning' : 'safe'}">
            <div class="dep-metric-icon">🚌</div>
            <div class="dep-metric-info">
                <div class="dep-metric-label">Bus Factor</div>
                <div class="dep-metric-value">${data.busFactor} maintainer${data.busFactor !== 1 ? 's' : ''}</div>
            </div>
        </div>
        <div class="dep-metric safe">
            <div class="dep-metric-icon">📊</div>
            <div class="dep-metric-info">
                <div class="dep-metric-label">Weekly Downloads</div>
                <div class="dep-metric-value">${data.weeklyDownloads}</div>
            </div>
        </div>
        <div class="dep-metric ${abandonSeverity}">
            <div class="dep-metric-icon">${data.abandoned ? '🪦' : '💚'}</div>
            <div class="dep-metric-info">
                <div class="dep-metric-label">Maintenance Status</div>
                <div class="dep-metric-value">${data.abandoned ? 'Abandoned / Deprecated' : 'Actively Maintained'}</div>
            </div>
        </div>
        ${data.modern ? `
        <div class="dep-metric safe" style="border-color:var(--p3-color);">
            <div class="dep-metric-icon">✨</div>
            <div class="dep-metric-info">
                <div class="dep-metric-label">Modern Alternative</div>
                <div class="dep-metric-value" style="font-family:var(--font-mono);font-size:0.85rem;">${data.modern}</div>
            </div>
        </div>` : ''}
        <div style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:0.83rem;color:var(--text-secondary);line-height:1.6;border:1px solid var(--glass-border);">
            💡 ${data.reason}
        </div>
    `;

    addActivity(`📦 Dep analyzed: <strong>${pkg}</strong> — Danger Score ${data.score}/100`);
}

/* ── Error Ancestry Tree ── */
function initAncestryTree() {
    document.getElementById('ancestryAnalyzeBtn')?.addEventListener('click', () => {
        const input = document.getElementById('ancestryInput').value.trim();
        if (!input) { showToast('Paste a stack trace first'); return; }
        buildAncestryTree(input);
    });
}

function buildAncestryTree(stackTrace) {
    const lower = stackTrace.toLowerCase();
    const result = document.getElementById('ancestryResult');
    const tree = document.getElementById('ancestryTree');
    result.style.display = 'block';
    tree.innerHTML = '';

    const hasNull    = lower.includes('undefined') || lower.includes('null') || lower.includes('cannot read');
    const hasAsync   = lower.includes('async') || lower.includes('await') || lower.includes('promise') || lower.includes('unhandled');
    const hasCORS    = lower.includes('cors') || lower.includes('cross-origin') || lower.includes('access-control');
    const hasModule  = lower.includes('cannot find module') || lower.includes('module not found');
    const hasMemory  = lower.includes('heap') || lower.includes('out of memory') || lower.includes('stack overflow');

    let nodes;

    if (hasModule) {
        nodes = [
            { type: 'root', label: 'Module Resolution Failure', desc: 'Node.js cannot locate the requested module at the given path or package name.', file: 'Runtime error at import/require statement' },
            { type: 'cause', label: 'Path or package name mismatch', desc: 'The module was either not installed, misspelled, or the import path is wrong relative to the current file.', file: 'Check: package.json dependencies & relative path' },
            { type: 'origin', label: 'Missing install step', desc: 'A new dependency was added to package.json but npm install was not re-run, or the file was renamed without updating imports.', file: null },
            { type: 'decision', label: 'Root Decision', desc: 'No import validation or automatic install hooks in the project setup. Adding a pre-check script or CI step would catch this immediately.', file: null },
        ];
    } else if (hasCORS) {
        nodes = [
            { type: 'root', label: 'CORS Blocked Request', desc: 'Browser enforced the Same-Origin Policy and rejected the cross-origin request before it reached your code.', file: 'DevTools → Network → preflight OPTIONS request' },
            { type: 'cause', label: 'Missing Access-Control headers', desc: 'Server response does not include Access-Control-Allow-Origin for this origin. Preflight fails, main request never fires.', file: 'Check server middleware / response headers' },
            { type: 'origin', label: 'Environment config mismatch', desc: 'CORS was never configured because the original API was built for same-origin use. When deployed or tested cross-origin, the missing config became a blocker.', file: null },
            { type: 'decision', label: 'Root Decision', desc: 'API was designed without considering cross-origin clients. Proper CORS middleware (e.g. cors npm package) should be a default in any HTTP server template.', file: null },
        ];
    } else if (hasMemory) {
        nodes = [
            { type: 'root', label: 'Memory Exhaustion / Stack Overflow', desc: 'Process exceeded V8 heap limit or call stack depth, causing a fatal crash.', file: 'Check: heap snapshot or recursive call depth' },
            { type: 'cause', label: 'Unchecked recursion or large data accumulation', desc: 'Either a function calls itself without a proper base case, or large objects are being accumulated without garbage collection opportunity.', file: null },
            { type: 'origin', label: 'Missing termination condition or unbounded loop', desc: 'The logic that grows the call stack or heap was written without an upper bound — works for small inputs, fails at scale.', file: null },
            { type: 'decision', label: 'Root Decision', desc: 'No load testing or large-data scenario was considered during initial design. Iterative approaches should replace recursion for deep trees.', file: null },
        ];
    } else if (hasAsync) {
        nodes = [
            { type: 'root', label: 'Unhandled Promise Rejection', desc: 'An async operation (fetch, DB call, file read) rejected or threw but the error was not caught anywhere in the call chain.', file: 'Look for: UnhandledPromiseRejectionWarning in Node' },
            { type: 'cause', label: 'Missing await or missing .catch()', desc: 'A Promise was created but either not awaited, or its rejection path was never handled, so the error propagated silently then crashed.', file: 'Check: async functions without try/catch' },
            { type: 'origin', label: 'Error boundary was never added', desc: 'The function was first written synchronously, then converted to async later — but no error handling was retrofitted when the pattern changed.', file: null },
            { type: 'decision', label: 'Root Decision', desc: 'Async error handling was treated as optional. All async operations need either try/catch or .catch() — this should be a code review checklist item.', file: null },
        ];
    } else if (hasNull) {
        nodes = [
            { type: 'root', label: 'Null / Undefined Access (Surface Error)', desc: 'Code tried to read a property or call a method on a value that does not exist at runtime — TypeError.', file: 'Check: the line number in the stack trace above' },
            { type: 'cause', label: 'Propagation — No null guard', desc: 'The component/function received data and immediately used it without checking if it arrived. A simple optional chaining (?.) or early return would have stopped propagation here.', file: 'Add: if (!data) return; or data?.property' },
            { type: 'origin', label: 'Data contract not enforced', desc: 'An API call, async fetch, or parent component passed an undefined / null value that the receiving function expected to always be present.', file: 'Check: where this data is first set / fetched' },
            { type: 'decision', label: 'Root Decision', desc: 'No default value was defined when the data schema was first designed. This made a crash inevitable the moment any edge case (empty response, race condition, deleted record) occurred.', file: 'Fix: add defaults at the data source' },
        ];
    } else {
        // Generic — parse lines from stack trace
        const lines = stackTrace.split('\n').filter(l => l.trim()).slice(0, 3);
        nodes = [
            { type: 'root', label: 'Surface Error', desc: lines[0] || 'The visible runtime exception that was thrown to your console.', file: lines[1] || null },
            { type: 'cause', label: 'Immediate Trigger', desc: 'The function or module that directly failed when it encountered unexpected input, state, or behaviour.', file: lines[2] || null },
            { type: 'origin', label: 'Upstream Assumption Gap', desc: 'An assumption upstream was never validated — incorrect data type, missing value, or unexpected state flowed downstream unchecked.', file: null },
            { type: 'decision', label: 'Root Decision', desc: 'The original design/implementation decision (missing validation, wrong type assumption, absent error boundary) that made this bug statistically inevitable once edge-cases appeared.', file: null },
        ];
    }

    const typeMap = { root: '🔴', cause: '🟠', origin: '🟡', decision: '🔵' };

    nodes.forEach((node, i) => {
        if (i > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'tree-arrow';
            arrow.textContent = '↓';
            tree.appendChild(arrow);
        }

        const el = document.createElement('div');
        el.className = `tree-node ${node.type}`;
        el.style.animationDelay = (i * 0.15) + 's';
        el.innerHTML = `
            <div class="tree-node-card">
                <div class="tree-node-type">${['Surface Error', 'Propagation Layer', 'Origin Gap', 'Root Decision'][i]}</div>
                <div class="tree-node-title">${typeMap[node.type]} ${node.label}</div>
                <div class="tree-node-desc">${node.desc}</div>
                ${node.file ? `<div class="tree-node-file">📍 ${node.file}</div>` : ''}
            </div>`;
        tree.appendChild(el);
    });

    addActivity('🌳 Error ancestry traced — root decision identified');
}

/* ── Context Capsule ── */
function initContextCapsule() {
    document.getElementById('capsuleGenerateBtn')?.addEventListener('click', generateCapsule);
    document.getElementById('capsuleCopyBtn')?.addEventListener('click', () => {
        const output = document.getElementById('capsuleOutput');
        if (output) {
            navigator.clipboard.writeText(output.innerText).then(() => {
                showToast('Context Capsule copied to clipboard! 🧬');
            });
        }
    });
}

function generateCapsule() {
    const feature  = document.getElementById('capsuleFeature').value.trim() || 'Untitled Feature';
    const what     = document.getElementById('capsuleWhat').value.trim();
    const failed   = document.getElementById('capsuleFailed').value.trim();
    const nextDev  = document.getElementById('capsuleNextDev').value.trim();

    if (!what) { showToast('Fill in what you built first'); return; }

    const result = document.getElementById('capsuleResult');
    const output = document.getElementById('capsuleOutput');
    result.style.display = 'flex';

    const timestamp = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const tags = generateCapsuleTags(what + ' ' + failed);

    output.innerHTML = `
        <h4>🧬 CONTEXT CAPSULE</h4>
        <div class="capsule-section">
            <strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Feature / PR</strong><br>
            ${feature}
            <br><br>
            <strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Generated</strong><br>
            ${timestamp}
        </div>
        <h4>📦 What Was Built</h4>
        <div class="capsule-section">${what}</div>
        ${failed ? `<h4>❌ What Was Tried & Failed</h4><div class="capsule-section">${failed}</div>` : ''}
        ${nextDev ? `<h4>🔑 Next Dev Needs To Know</h4><div class="capsule-section">${nextDev}</div>` : ''}
        <h4>⚡ AI Insights</h4>
        <div class="capsule-section">${generateInsights(what, failed)}</div>
        <h4>🏷️ Auto-Tags</h4>
        <div class="capsule-section" style="font-family:var(--font-mono);font-size:0.83rem;color:var(--accent-blue);">${tags}</div>
    `;

    addActivity(`🧬 Context Capsule generated: <strong>${feature}</strong>`);
}

function generateCapsuleTags(text) {
    const lower = text.toLowerCase();
    const tags = [];
    if (lower.includes('auth') || lower.includes('jwt') || lower.includes('login') || lower.includes('token')) tags.push('#authentication');
    if (lower.includes('api') || lower.includes('fetch') || lower.includes('endpoint') || lower.includes('rest')) tags.push('#api-integration');
    if (lower.includes('db') || lower.includes('database') || lower.includes('sql') || lower.includes('mongo')) tags.push('#database');
    if (lower.includes('react') || lower.includes('component') || lower.includes('hook') || lower.includes('state')) tags.push('#react');
    if (lower.includes('cors')) tags.push('#cors');
    if (lower.includes('async') || lower.includes('await') || lower.includes('promise')) tags.push('#async');
    if (lower.includes('performance') || lower.includes('slow') || lower.includes('cache') || lower.includes('optimiz')) tags.push('#performance');
    if (lower.includes('test') || lower.includes('spec') || lower.includes('jest') || lower.includes('vitest')) tags.push('#testing');
    if (lower.includes('style') || lower.includes('css') || lower.includes('design') || lower.includes('ui')) tags.push('#frontend');
    if (tags.length === 0) tags.push('#feature', '#general');
    return tags.join('  ');
}

function generateInsights(what, failed) {
    const lower = (what + ' ' + failed).toLowerCase();
    const insights = [];
    if (lower.includes('async') || lower.includes('await')) insights.push('Async patterns detected — ensure all await calls are wrapped in try/catch and have fallback states.');
    if (lower.includes('state') || lower.includes('redux') || lower.includes('context')) insights.push('State management involved — watch for stale closure issues and ensure cleanup on unmount.');
    if (lower.includes('database') || lower.includes('query') || lower.includes('sql')) insights.push('Database operations present — verify all queries are parameterized and connection pooling is configured correctly.');
    if (lower.includes('auth') || lower.includes('token') || lower.includes('password')) insights.push('Authentication logic present — have this code reviewed for security vulnerabilities before merging.');
    if (insights.length === 0) insights.push('Review the data flow from input to output. Verify every assumption about shape and type is either enforced by TypeScript or guarded with a runtime check.');
    insights.push('Add integration tests for the edge cases that surfaced during the failed attempts described above.');
    return insights.map(i => '• ' + i).join('<br>');
}

/* ── Quiet Mentor ── */
function initQuietMentor() {
    document.getElementById('mentorAnalyzeBtn')?.addEventListener('click', () => {
        const input = document.getElementById('mentorInput').value.trim();
        if (!input) { showToast('Paste your session code or diff first'); return; }
        generateMentorDebrief(input);
    });
}

function generateMentorDebrief(code) {
    const result  = document.getElementById('mentorResult');
    const debrief = document.getElementById('mentorDebrief');
    result.style.display = 'block';
    debrief.innerHTML = '';

    const lower = code.toLowerCase();
    const lines = code.split('\n').length;
    const insights = [];

    // Check for console logs
    const consoleLogs = (code.match(/console\.(log|error|warn|info)/g) || []).length;
    if (consoleLogs > 0) {
        insights.push({
            type: 'warning',
            icon: '🪵',
            title: `${consoleLogs} Console Statement${consoleLogs > 1 ? 's' : ''} Left Behind`,
            text: `You left ${consoleLogs} <code>console.log/error</code> statement${consoleLogs > 1 ? 's' : ''} in your code. Remove these before committing, or replace with a structured logger (winston, pino, loglevel) with severity levels.`,
            code: null,
        });
    }

    // async without error handling
    if ((lower.includes('fetch(') || lower.includes('await ')) && !lower.includes('try') && !lower.includes('.catch')) {
        insights.push({
            type: 'critical',
            icon: '💥',
            title: 'Async Operations Without Error Boundaries',
            text: `Your async calls have no <code>try/catch</code> blocks or <code>.catch()</code> handlers. If the network or operation fails, you'll get an UnhandledPromiseRejection that can crash Node servers or silently break UI.`,
            code: `// Wrap like this:\ntry {\n  const data = await fetchUser(id);\n} catch (err) {\n  console.error('fetchUser failed:', err);\n  return null; // fallback\n}`,
        });
    }

    // TODOs / FIXMEs
    const todos = (code.match(/TODO|FIXME|HACK|XXX/gi) || []).length;
    if (todos > 0) {
        insights.push({
            type: 'warning',
            icon: '📌',
            title: `${todos} Unresolved TODO/FIXME Marker${todos > 1 ? 's' : ''}`,
            text: `You marked ${todos} piece${todos > 1 ? 's' : ''} of code as needing follow-up. Comments like TODO rarely get revisited — move these to your issue tracker now while context is fresh.`,
            code: null,
        });
    }

    // setTimeout/setInterval without cleanup
    if (lower.includes('settimeout') || lower.includes('setinterval')) {
        insights.push({
            type: 'warning',
            icon: '⏱️',
            title: 'Timer Used — Verify Cleanup on Teardown',
            text: `<code>setTimeout/setInterval</code> detected. Verify these are cleared (clearTimeout/clearInterval) when the component unmounts or module tears down — uncleaned timers are a leading cause of memory leaks in long-running apps.`,
            code: null,
        });
    }

    // Large session
    if (lines > 80) {
        insights.push({
            type: 'tip',
            icon: '📐',
            title: `Large Session — ${lines} Lines Modified`,
            text: `Your session touched ${lines} lines. If you rewrote any logic more than once, that's a signal the abstraction is still evolving. Consider extracting a utility function or custom hook to stabilise the interface.`,
            code: null,
        });
    }

    // Positive / clean code
    if (insights.length === 0) {
        insights.push({
            type: 'positive',
            icon: '✅',
            title: 'Clean, Consistent Session',
            text: `No obvious issues detected. Your code shows consistent naming conventions and readable structure. Consider adding JSDoc comments to public functions — the intent is clearest right now, while the session is fresh.`,
            code: null,
        });
        insights.push({
            type: 'tip',
            icon: '🧪',
            title: 'Write Tests While Intent is Fresh',
            text: `You just built something — adding 2–3 edge-case unit tests right now takes 10 minutes and prevents regressions for months. The scenarios you tried (and failed) today are exactly the test cases you need.`,
            code: null,
        });
    }

    // Always add reflection observation
    insights.push({
        type: 'tip',
        icon: '🔍',
        title: 'End-of-Session Reflection',
        text: `Identify the <strong>single decision point</strong> that cost the most time today — that's your highest-ROI area to improve next session. Was it unclear requirements, a missing tool, or an environment issue? Log it.`,
        code: null,
    });

    insights.slice(0, 3).forEach((obs, i) => {
        const item = document.createElement('div');
        item.className = `mentor-insight ${obs.type}`;
        item.style.animationDelay = (i * 0.18) + 's';
        item.innerHTML = `
            <div class="mentor-insight-icon">${obs.icon}</div>
            <div class="mentor-insight-body">
                <div class="mentor-insight-title">${obs.title}</div>
                <div class="mentor-insight-text">${obs.text}</div>
                ${obs.code ? `<div class="mentor-insight-code">${obs.code}</div>` : ''}
            </div>`;
        debrief.appendChild(item);
    });

    // Update session history
    const history = document.getElementById('mentorHistory');
    const emptyEl = history.querySelector('.empty-state-small');
    if (emptyEl) emptyEl.remove();

    const entry = document.createElement('div');
    entry.className = 'mentor-history-item';
    entry.innerHTML = `<span>🦉</span><span style="flex:1;">Session at ${formatTime(new Date())} — ${lines} lines, ${Math.min(insights.length, 3)} insights</span>`;
    history.insertBefore(entry, history.firstChild);

    addActivity(`🦉 Mentor debrief done — ${Math.min(insights.length, 3)} insights across ${lines} lines`);
}

/* ==============================================
   COMMIT RISK PREDICTOR
   ============================================== */

const commitRiskDemos = {
    'sql-injection': `- db.query(\`SELECT * FROM users WHERE id = ?\`, [id]);
+ db.query('DELETE FROM users WHERE id=' + req.params.id);
+ db.query('SELECT * FROM secrets WHERE role=' + req.body.role);

  app.post('/api/admin', (req, res) => {
-   if (req.user.isAdmin) {
+   // auth check removed for testing
      return res.json(adminData);
-   }
  });`,
    'auth-bypass': `  function checkPermission(user, resource) {
-   if (user.role !== 'admin' && !user.permissions.includes(resource)) {
-     throw new ForbiddenError('Access denied');
-   }
+   // TODO: re-enable after demo
+   return true;
  }

- const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
+ const token = jwt.sign(payload, 'secret123', { expiresIn: '30d' });

+ app.get('/api/debug/users', (req, res) => {
+   res.json(allUsers);  // includes passwords
+ });`,
    'perf-regression': `- const BATCH_SIZE = 100;
+ const BATCH_SIZE = 10000;

- const cache = new LRU({ max: 500, ttl: 60000 });
+ // const cache = new LRU({ max: 500, ttl: 60000 });

  async function processOrders(orders) {
-   const batches = chunk(orders, BATCH_SIZE);
-   for (const batch of batches) {
-     await Promise.all(batch.map(o => saveOrder(o)));
-   }
+   for (const order of orders) {
+     await saveOrder(order);
+     await sleep(10);
+   }
  }

+ app.get('/api/reports', async (req, res) => {
+   const all = await db.query('SELECT * FROM transactions');
+   res.json(all); // could be millions of rows
+ });`
};

function initCommitRisk() {
    document.getElementById('commitriskAnalyzeBtn')?.addEventListener('click', () => {
        const input = document.getElementById('commitriskInput').value.trim();
        if (!input) { showToast('Paste a diff first'); return; }
        analyzeCommitRisk(input);
    });

    document.querySelectorAll('.cr-demo-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const demo = commitRiskDemos[chip.dataset.demo];
            if (demo) {
                document.getElementById('commitriskInput').value = demo;
                analyzeCommitRisk(demo);
            }
        });
    });
}

function analyzeCommitRisk(diff) {
    const lower = diff.toLowerCase();
    const result = document.getElementById('commitriskResult');
    result.style.display = 'flex';

    const warnings = [];
    let score = 5; // base risk

    // SQL Injection
    if (lower.includes('+ ') && (lower.includes("req.params") || lower.includes("req.body") || lower.includes("req.query")) && (lower.includes("query(") || lower.includes("exec("))) {
        if (lower.includes("'+") || lower.includes("\" +") || lower.includes('+ req.')) {
            warnings.push({ severity: 'critical', icon: '💉', title: 'SQL Injection Vulnerability', text: 'String concatenation used in database queries with user input. An attacker can inject arbitrary SQL. Use parameterized queries or ORM methods.', line: 'Detected: string concatenation in db.query()' });
            score += 35;
        }
    }

    // Auth bypass
    if ((lower.includes('- ') && lower.includes('if') && (lower.includes('admin') || lower.includes('auth') || lower.includes('permission') || lower.includes('role'))) ||
        (lower.includes('//') && (lower.includes('auth') || lower.includes('check') || lower.includes('permission')) && (lower.includes('removed') || lower.includes('disabled') || lower.includes('todo') || lower.includes('testing')))) {
        warnings.push({ severity: 'critical', icon: '🔓', title: 'Authentication/Authorization Bypass', text: 'Security check was removed or commented out. Any user can now access protected resources. Never disable auth checks — use feature flags or test-specific middleware instead.', line: 'Detected: security check removed or commented' });
        score += 30;
    }

    // Hardcoded secrets
    if (lower.includes("'secret") || lower.includes('"secret') || (lower.includes('password') && lower.includes("'")) || lower.includes('api_key') || lower.includes('apikey')) {
        warnings.push({ severity: 'critical', icon: '🔑', title: 'Hardcoded Secret/Credential', text: 'Credentials or API keys are hardcoded in source code. These will be visible in version control. Use environment variables or a secrets manager (AWS Secrets Manager, Vault).', line: 'Detected: secret/password in source' });
        score += 25;
    }

    // Debug endpoints
    if (lower.includes('debug') && (lower.includes('/api') || lower.includes('app.get') || lower.includes('app.post'))) {
        warnings.push({ severity: 'high', icon: '🐛', title: 'Debug Endpoint Left in Code', text: 'A debug/diagnostic endpoint is being added. If this reaches production, it could expose internal data or allow unauthorized actions. Gate behind NODE_ENV check at minimum.', line: 'Detected: debug route exposed' });
        score += 15;
    }

    // Commented-out code
    const commentedLines = (diff.match(/^\+\s*\/\//gm) || []).length;
    if (commentedLines >= 2) {
        warnings.push({ severity: 'medium', icon: '💬', title: `${commentedLines} Lines of Commented-Out Code`, text: 'Commented-out code clutters the codebase and creates confusion about what\'s active. If the code is being removed, delete it — git history preserves it. If it\'s temporary, track it in an issue.', line: `${commentedLines} commented lines detected` });
        score += 8;
    }

    // Performance: removed caching
    if (lower.includes('- ') && (lower.includes('cache') || lower.includes('lru') || lower.includes('redis') || lower.includes('memo'))) {
        warnings.push({ severity: 'high', icon: '🐌', title: 'Caching Layer Removed', text: 'A cache or memoization layer was removed. This can cause N+1 queries or repeated expensive computations under high traffic. Verify that the cache was actually unused before removing.', line: 'Detected: cache/memoization removed' });
        score += 18;
    }

    // SELECT *
    if (lower.includes('select *') && (lower.includes('transactions') || lower.includes('users') || lower.includes('orders') || lower.includes('logs'))) {
        warnings.push({ severity: 'high', icon: '📊', title: 'Unbounded SELECT * on Large Table', text: 'A SELECT * without LIMIT on what could be a high-volume table. In production this can return millions of rows, causing OOM crashes and network saturation. Add pagination (LIMIT/OFFSET) and select only needed columns.', line: 'Detected: SELECT * without LIMIT' });
        score += 15;
    }

    // Batch size change
    if (lower.includes('batch_size') || lower.includes('batchsize')) {
        const numMatch = diff.match(/\+.*?(\d{4,})/);
        if (numMatch) {
            warnings.push({ severity: 'medium', icon: '📦', title: 'Batch Size Increased Significantly', text: `Batch size was increased to ${numMatch[1]}. Large batches can cause memory spikes, database timeouts, and slow rollbacks. Load-test with production-scale data before merging.`, line: `New batch size: ${numMatch[1]}` });
            score += 10;
        }
    }

    // Sequential awaits (perf)
    if (lower.includes('for (') && lower.includes('await ') && !lower.includes('promise.all')) {
        warnings.push({ severity: 'medium', icon: '🔄', title: 'Sequential Awaits in Loop', text: 'Awaiting inside a loop runs operations one-at-a-time. If operations are independent, use Promise.all() with batching for parallel execution — can be 10-50x faster.', line: 'Detected: await inside for loop' });
        score += 10;
    }

    // Token expiry too long
    const expiryMatch = diff.match(/expiresIn:\s*['"](\d+)d['"]/);
    if (expiryMatch && parseInt(expiryMatch[1]) > 7) {
        warnings.push({ severity: 'medium', icon: '⏰', title: `Token Expiry: ${expiryMatch[1]} Days`, text: `JWT tokens set to expire in ${expiryMatch[1]} days. If a token is compromised, the attacker has a long window. Use short-lived access tokens (15min-1hr) with refresh token rotation.`, line: `expiresIn: ${expiryMatch[1]}d` });
        score += 12;
    }

    // DELETE without WHERE
    if (lower.includes('delete from') && !lower.includes('where')) {
        warnings.push({ severity: 'critical', icon: '🗑️', title: 'DELETE Without WHERE Clause', text: 'This query will delete ALL rows in the table. If this reaches production, you lose all data in that table. Always include a WHERE clause and test with LIMIT first.', line: 'Detected: DELETE FROM without WHERE' });
        score += 30;
    }

    // No warnings = clean diff
    if (warnings.length === 0) {
        warnings.push({ severity: 'low', icon: '✅', title: 'No Major Issues Detected', text: 'This diff looks clean. No obvious security, performance, or reliability issues found. Standard code review still recommended — automated analysis only catches known patterns.', line: null });
    }

    score = Math.min(score, 98);

    // Render score
    const scoreColor = score >= 75 ? '#ff3b5c' : score >= 50 ? '#ff9100' : score >= 25 ? '#ffcc00' : '#00e676';
    const verdict = score >= 75 ? '🚫 DO NOT MERGE' : score >= 50 ? '⚠️ HIGH RISK' : score >= 25 ? '⚡ CAUTION' : '✅ SAFE TO MERGE';
    const verdictBg = score >= 75 ? 'rgba(255,59,92,0.15)' : score >= 50 ? 'rgba(255,145,0,0.15)' : score >= 25 ? 'rgba(255,204,0,0.12)' : 'rgba(0,230,118,0.12)';

    document.getElementById('commitriskScoreNum').textContent = score;
    document.getElementById('commitriskScoreNum').style.color = scoreColor;
    const verdictEl = document.getElementById('commitriskVerdict');
    verdictEl.textContent = verdict;
    verdictEl.style.color = scoreColor;
    verdictEl.style.background = verdictBg;

    // Animate meter
    const meterFill = document.getElementById('commitriskMeterFill');
    meterFill.style.setProperty('--reveal', (100 - score) + '%');
    setTimeout(() => { meterFill.style.cssText = `position:relative;overflow:hidden;height:12px;border-radius:6px;background:linear-gradient(90deg,#00e676 0%,#ffcc00 35%,#ff9100 60%,#ff3b5c 85%,#d50000 100%);`; meterFill.innerHTML = `<div style="position:absolute;top:0;right:0;height:100%;width:${100-score}%;background:rgba(10,10,15,0.85);border-radius:0 6px 6px 0;transition:width 1.2s cubic-bezier(0.4,0,0.2,1);"></div>`; }, 50);

    // Render warnings
    const warningsEl = document.getElementById('commitriskWarnings');
    warningsEl.innerHTML = '';
    warnings.forEach((w, i) => {
        const el = document.createElement('div');
        el.className = `cr-warning ${w.severity}`;
        el.style.animationDelay = (i * 0.12) + 's';
        el.innerHTML = `
            <div class="cr-warning-icon">${w.icon}</div>
            <div class="cr-warning-body">
                <div class="cr-warning-title">${w.title}</div>
                <div class="cr-warning-text">${w.text}</div>
                ${w.line ? `<div class="cr-warning-line">📍 ${w.line}</div>` : ''}
            </div>`;
        warningsEl.appendChild(el);
    });

    // Summary
    const critCount = warnings.filter(w => w.severity === 'critical').length;
    const highCount = warnings.filter(w => w.severity === 'high').length;
    document.getElementById('commitriskSummary').innerHTML = `
        <strong>📊 Risk Summary:</strong> ${warnings.length} issue${warnings.length !== 1 ? 's' : ''} found
        ${critCount ? ` · <span style="color:var(--p0-color)">${critCount} critical</span>` : ''}
        ${highCount ? ` · <span style="color:var(--p1-color)">${highCount} high</span>` : ''}
        <br><br>
        <strong>💡 Recommendation:</strong> ${score >= 50 ? 'This commit needs security review before merging. Address critical issues first, then re-run analysis.' : 'Low risk. Proceed with standard code review processes.'}
    `;

    addActivity(`⚡ Commit risk analyzed — Score: ${score}/100 (${warnings.length} issues)`);
}

/* ==============================================
   INCIDENT POST-MORTEM GENERATOR
   ============================================== */

function initPostMortem() {
    document.getElementById('pmGenerateBtn')?.addEventListener('click', generatePostMortem);
    document.getElementById('pmCopyBtn')?.addEventListener('click', () => {
        const output = document.getElementById('pmOutput');
        if (output) {
            navigator.clipboard.writeText(output.innerText).then(() => {
                showToast('Post-Mortem copied to clipboard! 📋');
            });
        }
    });
    document.getElementById('pmDownloadBtn')?.addEventListener('click', downloadPostMortem);
}

function generatePostMortem() {
    const whatBroke  = document.getElementById('pmWhatBroke').value.trim();
    const when       = document.getElementById('pmWhen').value.trim() || 'Not specified';
    const duration   = document.getElementById('pmDuration').value.trim() || 'Unknown';
    const rootCause  = document.getElementById('pmRootCause').value.trim();
    const fix        = document.getElementById('pmFix').value.trim();
    const impact     = document.getElementById('pmImpact').value.trim() || 'Under assessment';

    if (!whatBroke) { showToast('Describe what broke first'); return; }
    if (!rootCause) { showToast('What was the root cause?'); return; }

    const result = document.getElementById('pmResult');
    const output = document.getElementById('pmOutput');
    result.style.display = 'flex';

    const severity = determinePMSeverity(whatBroke, impact);
    const sevColor = { 'SEV-1': 'var(--p0-color)', 'SEV-2': 'var(--p1-color)', 'SEV-3': 'var(--p2-color)' }[severity] || 'var(--p2-color)';
    const sevBg = { 'SEV-1': 'rgba(255,23,68,0.12)', 'SEV-2': 'rgba(255,109,0,0.12)', 'SEV-3': 'rgba(255,214,0,0.1)' }[severity] || 'rgba(255,214,0,0.1)';
    const timestamp = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeline = generateTimeline(when, duration);
    const actionItems = generateActionItems(rootCause, fix, whatBroke);
    const lessons = generateLessons(rootCause, whatBroke);

    output.innerHTML = `
        <h3>📋 INCIDENT POST-MORTEM</h3>
        <div style="text-align:center;">
            <div class="pm-severity-badge" style="color:${sevColor};background:${sevBg};">${severity} — ${whatBroke.substring(0, 60)}</div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">📌 Executive Summary</div>
            <div class="pm-section-content">
                On <strong>${when}</strong>, an incident occurred affecting ${impact}. The outage lasted approximately <strong>${duration}</strong>. Root cause was identified as: ${rootCause.substring(0, 200)}. ${fix ? 'The issue was resolved by: ' + fix.substring(0, 150) + '.' : 'Mitigation is in progress.'}
            </div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">🕐 Timeline</div>
            <div class="pm-section-content">
                ${timeline}
            </div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">🔍 Root Cause Analysis</div>
            <div class="pm-section-content">
                <strong>Primary cause:</strong> ${rootCause}<br><br>
                <strong>Contributing factors:</strong><br>
                ${generateContributingFactors(rootCause, whatBroke)}
            </div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">💊 Resolution</div>
            <div class="pm-section-content">
                ${fix || 'Resolution details pending. Update this section once the fix is fully deployed and verified.'}
            </div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">💥 Impact</div>
            <div class="pm-section-content">
                <strong>Users affected:</strong> ${impact}<br>
                <strong>Duration:</strong> ${duration}<br>
                <strong>Services impacted:</strong> ${extractServices(whatBroke)}
            </div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">✅ Action Items</div>
            <div class="pm-section-content">
                ${actionItems}
            </div>
        </div>

        <div class="pm-section">
            <div class="pm-section-title">📚 Lessons Learned</div>
            <div class="pm-section-content">
                ${lessons}
            </div>
        </div>

        <div style="text-align:center;padding-top:16px;border-top:1px solid var(--glass-border);font-size:0.75rem;color:var(--text-muted);">
            Generated by CodeRescue AI · ${timestamp} · Document ID: PM-${Date.now().toString(36).toUpperCase()}
        </div>
    `;

    addActivity(`📋 Post-Mortem generated: ${severity} — ${whatBroke.substring(0, 40)}`);
}

function determinePMSeverity(whatBroke, impact) {
    const lower = (whatBroke + ' ' + impact).toLowerCase();
    if (lower.includes('down') || lower.includes('outage') || lower.includes('all users') || lower.includes('production') || lower.includes('revenue')) return 'SEV-1';
    if (lower.includes('500') || lower.includes('error') || lower.includes('fail') || lower.includes('slow') || lower.includes('breach')) return 'SEV-2';
    return 'SEV-3';
}

function generateTimeline(when, duration) {
    const times = [
        { time: when || 'T+0:00', event: 'Incident detected — monitoring alert triggered' },
        { time: 'T+0:05', event: 'On-call engineer acknowledged alert and began investigation' },
        { time: 'T+0:12', event: 'Root cause identified — began working on fix' },
        { time: 'T+0:25', event: 'Fix deployed to staging — verification started' },
        { time: `T+${duration || '0:45'}`, event: 'Fix deployed to production — service restored' },
        { time: 'Post-incident', event: 'Monitoring confirmed full recovery — post-mortem scheduled' },
    ];
    return times.map(t => `<div class="pm-timeline-item"><span class="pm-timeline-time">${t.time}</span><span class="pm-timeline-event">${t.event}</span></div>`).join('');
}

function generateContributingFactors(rootCause, whatBroke) {
    const lower = (rootCause + ' ' + whatBroke).toLowerCase();
    const factors = [];
    if (lower.includes('migration') || lower.includes('deploy') || lower.includes('release')) factors.push('Deployment process did not include sufficient pre-production validation');
    if (lower.includes('database') || lower.includes('db') || lower.includes('query') || lower.includes('index')) factors.push('Database changes were not load-tested with production-scale data');
    if (lower.includes('config') || lower.includes('env') || lower.includes('variable')) factors.push('Configuration management lacked proper environment-specific validation');
    factors.push('Monitoring did not catch the degradation early enough to prevent user impact');
    factors.push('Runbook for this failure mode did not exist or was outdated');
    return factors.map(f => `• ${f}`).join('<br>');
}

function extractServices(whatBroke) {
    const lower = whatBroke.toLowerCase();
    const services = [];
    if (lower.includes('api') || lower.includes('endpoint')) services.push('API Gateway');
    if (lower.includes('payment') || lower.includes('billing') || lower.includes('stripe')) services.push('Payment Service');
    if (lower.includes('auth') || lower.includes('login') || lower.includes('sso')) services.push('Authentication Service');
    if (lower.includes('database') || lower.includes('db') || lower.includes('query')) services.push('Database Layer');
    if (lower.includes('frontend') || lower.includes('ui') || lower.includes('web')) services.push('Web Frontend');
    if (services.length === 0) services.push('Core application service');
    return services.join(', ');
}

function generateActionItems(rootCause, fix, whatBroke) {
    const lower = (rootCause + ' ' + fix + ' ' + whatBroke).toLowerCase();
    const items = [];
    items.push({ priority: 'P0', text: 'Verify fix is stable in production with extended monitoring period (48 hours)' });
    if (lower.includes('migration') || lower.includes('database') || lower.includes('index')) {
        items.push({ priority: 'P0', text: 'Add database migration dry-run step to CI/CD pipeline' });
        items.push({ priority: 'P1', text: 'Create automated rollback procedure for database changes' });
    }
    if (lower.includes('auth') || lower.includes('security') || lower.includes('permission')) {
        items.push({ priority: 'P0', text: 'Conduct security audit of all authentication endpoints' });
    }
    items.push({ priority: 'P1', text: 'Add specific alerting for this failure mode with <5 minute detection SLA' });
    items.push({ priority: 'P1', text: 'Create/update runbook with step-by-step remediation for this incident type' });
    items.push({ priority: 'P2', text: 'Schedule blameless post-mortem meeting with all stakeholders within 72 hours' });
    items.push({ priority: 'P2', text: 'Add load testing for the affected service to CI/CD pipeline' });
    return items.map(item => `<div class="pm-action-item"><span class="pm-action-priority ${item.priority.toLowerCase()}">${item.priority}</span><span>${item.text}</span></div>`).join('');
}

function generateLessons(rootCause, whatBroke) {
    const lessons = [];
    lessons.push('• <strong>What went well:</strong> Incident was detected by monitoring (not user reports). Team mobilised quickly and communicated status.');
    lessons.push('• <strong>What went wrong:</strong> The change that caused the incident was not caught by existing test coverage or review process.');
    lessons.push('• <strong>Where we got lucky:</strong> The blast radius could have been larger if this occurred during peak traffic hours.');
    lessons.push('• <strong>Key takeaway:</strong> Any change that touches data or infrastructure should require a mandatory canary deployment phase before full rollout.');
    return lessons.join('<br><br>');
}

function downloadPostMortem() {
    const output = document.getElementById('pmOutput');
    if (!output) return;
    const text = output.innerText;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-mortem-${Date.now().toString(36)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Post-Mortem downloaded as .md file! 📄');
}

/* ==============================================
   RUBBER DUCK MODE
   ============================================== */

const duckDemos = {
    'infinite-loop': 'My React component re-renders infinitely when I add a useEffect that calls an API and updates state. The page freezes within seconds.',
    'state-bug': 'I\'m updating a state variable in a click handler but when I console.log it right after setState, it still shows the old value. The UI shows the right value though.',
    'api-fail': 'My fetch call to /api/dashboard returns 403 Forbidden in production but works perfectly on localhost. I\'m sending the auth token in the headers.',
};

const duckQuestions = {
    'infinite-loop': [
        { q: '**What changes exactly when this effect runs?** List every piece of state or prop that gets modified inside your useEffect. Does the effect\'s dependency array include any of those modified values?', insight: 'You\'re looking for circular dependencies: effect changes X → X is in dependency array → effect re-runs → changes X again → infinite.' },
        { q: '**What would happen if you commented out the setState call** inside the useEffect? Would the re-renders stop? If yes, the problem is that your effect both reads and writes the same state cycle.', insight: 'The mental model: useEffect with a state setter that triggers its own dependency = infinite loop. Every time.' },
        { q: '**When should this data actually be fetched?** Only once on mount? On every route change? On a button click? Write the exact words: \"This API call should happen when ___\"', insight: 'If the answer is "once on mount," your dependency array should be []. If it\'s on specific changes, those specific values — and nothing else — go in the array.' },
        { q: '**Can you separate the fetch from the render trigger?** What if the API call result went into a ref first, and only updated state when the data actually changed (using a comparison)?', insight: 'Pattern: fetch → compare with previous → only setState if different. Or use useCallback/useMemo to stabilise the values in your dependency array.' },
    ],
    'state-bug': [
        { q: '**Where exactly did you put the console.log?** Is it on the line immediately after setState? In React, state updates are asynchronous and batched — the new value isn\'t available on the next line.', insight: 'setState doesn\'t mutate the current variable. It schedules a re-render with the new value. The closure still has the old one.' },
        { q: '**If the UI shows the correct value, what does that tell you?** The component IS re-rendering with the right state — so the update works. The only question is: why does your log show the old value?', insight: 'Closures. The console.log captures the state value from the current render. The next render hasn\'t happened yet when log runs.' },
        { q: '**How would you verify the state after it updates?** Can you think of a React hook that runs AFTER state changes are applied to the DOM?', insight: 'useEffect with the state variable in its dependency array runs after the re-render — that\'s where you\'d log the new value.' },
        { q: '**What would this code look like if you used the functional update form?** Instead of setState(newValue), try setState(prev => { console.log(prev); return newValue; }). What does prev show you?', insight: 'The functional form (prev => newValue) always gets the latest state. It\'s also batching-safe. This is the pattern you want.' },
    ],
    'api-fail': [
        { q: '**What\'s different about your production environment?** List 3 things that are different between localhost and production: URLs, domains, proxy settings, CORS config, cookie policies...', insight: 'localhost often bypasses security policies that production enforces. The 403 is the server rejecting auth, not a network error.' },
        { q: '**Is the token actually reaching the server?** Open DevTools → Network tab → click the failed request → look at Request Headers. Is the Authorization header present? Is the token complete or truncated?', insight: 'If the header is missing, it\'s a client-side issue (cookie not sent cross-origin, or header not set). If present but rejected, it\'s a server-side validation issue.' },
        { q: '**Does your production server have a different auth configuration?** Different JWT secret, different allowed origins, different token issuer? What returns 403 specifically — middleware, API gateway, or your route handler?', insight: 'Check: same JWT_SECRET env var in production? CORS configuration allowing the production origin? Token not expired? Check server logs for the exact rejection reason.' },
        { q: '**Can you make the same request using curl from the production server itself?** If curl with the token works from the server but the browser fails, it\'s a CORS/cookie/preflight issue. If curl also fails, it\'s the token itself.', insight: 'curl localhost:3000/api/dashboard -H "Authorization: Bearer <token>" — this isolates browser vs. server issues instantly.' },
    ],
};

const genericDuckQuestions = [
    { q: '**What exactly did you expect to happen?** Write it out in one sentence. Then write what actually happens. The gap between these two sentences is your real bug.', insight: 'Precision matters. "It doesn\'t work" has no information. "I expected X but got Y" immediately narrows the search.' },
    { q: '**What was the last thing you changed before this broke?** Not what you think caused it — what literally was the last git diff, the last edit, the last config change?', insight: 'The most recent change is statistically the most likely cause. Check your git diff, undo it, verify the bug disappears.' },
    { q: '**If you had to explain this code to a new junior dev, what\'s the one part you\'d skip over?** That\'s probably where the bug is. The part you don\'t fully understand is the part that misbehaves.', insight: 'We gloss over what we don\'t understand. The bug lives in the gaps of our mental model. Shine a light there.' },
    { q: '**What assumptions are you making that you haven\'t verified?** "The API returns an array" — have you checked? "This function is async" — is it? "The env variable is set" — console.log it.', insight: 'Every assumption is a potential bug. Verify the top 3 assumptions right now: log them, inspect them, prove them true.' },
];

let duckState = { step: 0, questions: [], problem: '' };

function initRubberDuck() {
    document.getElementById('duckStartBtn')?.addEventListener('click', () => {
        const problem = document.getElementById('duckProblem').value.trim();
        if (!problem) { showToast('Describe what you\'re stuck on first'); return; }
        startDuckSession(problem);
    });

    document.getElementById('duckReplyBtn')?.addEventListener('click', duckReply);
    document.getElementById('duckRestartBtn')?.addEventListener('click', resetDuckSession);

    document.getElementById('duckInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            duckReply();
        }
    });

    document.querySelectorAll('.duck-demo-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const demo = duckDemos[chip.dataset.demo];
            if (demo) {
                document.getElementById('duckProblem').value = demo;
                startDuckSession(demo);
            }
        });
    });
}

function startDuckSession(problem) {
    duckState = { step: 0, questions: [], problem };

    // Pick questions based on problem
    const lower = problem.toLowerCase();
    if (lower.includes('re-render') || lower.includes('infinite') || lower.includes('useeffect') || lower.includes('loop')) {
        duckState.questions = duckQuestions['infinite-loop'];
    } else if (lower.includes('state') && (lower.includes('old') || lower.includes('not updating') || lower.includes('stale') || lower.includes('console.log'))) {
        duckState.questions = duckQuestions['state-bug'];
    } else if (lower.includes('403') || lower.includes('401') || (lower.includes('api') && (lower.includes('fail') || lower.includes('forbidden') || lower.includes('unauthorized')))) {
        duckState.questions = duckQuestions['api-fail'];
    } else {
        duckState.questions = genericDuckQuestions;
    }

    document.getElementById('duckStart').style.display = 'none';
    document.getElementById('duckConversation').style.display = 'flex';
    document.getElementById('duckComplete').style.display = 'none';
    document.getElementById('duckInputArea').style.display = 'flex';

    const messages = document.getElementById('duckMessages');
    messages.innerHTML = '';

    // Show duck intro
    addDuckMessage('duck', `🦆 Thanks for sharing. I've read your problem — now I'm going to ask you 4 questions. I won't give you the answer. Instead, **think through each one carefully** before replying. Most developers find their own answer by question 3.`);

    // Show user's problem
    addDuckMessage('user', problem);

    // Ask first question
    setTimeout(() => {
        askDuckQuestion();
    }, 600);

    updateDuckProgress();
    addActivity('🦆 Rubber Duck session started');
}

function askDuckQuestion() {
    if (duckState.step >= duckState.questions.length) {
        completeDuckSession();
        return;
    }

    const q = duckState.questions[duckState.step];
    addDuckMessage('duck', q.q);
    document.getElementById('duckInput').focus();
}

function duckReply() {
    const input = document.getElementById('duckInput');
    const text = input.value.trim();
    if (!text) { showToast('Think about it and type your answer'); return; }

    addDuckMessage('user', text);
    input.value = '';

    // Show insight for previous question
    const q = duckState.questions[duckState.step];
    setTimeout(() => {
        addDuckMessage('duck', `💡 *Insight:* ${q.insight}`);

        duckState.step++;
        updateDuckProgress();

        if (duckState.step >= duckState.questions.length) {
            setTimeout(() => completeDuckSession(), 800);
        } else {
            setTimeout(() => askDuckQuestion(), 800);
        }
    }, 500);
}

function addDuckMessage(type, text) {
    const messages = document.getElementById('duckMessages');
    const msg = document.createElement('div');
    msg.className = `duck-msg ${type}`;
    msg.innerHTML = `
        <div class="duck-msg-header">${type === 'duck' ? '🦆 Rubber Duck' : '👤 You'}</div>
        <div class="duck-msg-text">${formatMessage(text)}</div>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function updateDuckProgress() {
    const steps = document.querySelectorAll('.duck-step');
    steps.forEach((s, i) => {
        s.classList.remove('active', 'done');
        if (i < duckState.step) s.classList.add('done');
        else if (i === duckState.step) s.classList.add('active');
    });
    const fill = document.getElementById('duckProgressFill');
    fill.style.width = (duckState.step / duckState.questions.length * 100) + '%';
}

function completeDuckSession() {
    document.getElementById('duckInputArea').style.display = 'none';
    document.getElementById('duckComplete').style.display = 'block';

    document.querySelectorAll('.duck-step').forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
    document.getElementById('duckProgressFill').style.width = '100%';

    document.getElementById('duckCompleteSummary').innerHTML = `You answered all 4 questions about: "<em>${duckState.problem.substring(0, 80)}...</em>"<br><br>If you found your answer — great, that's the power of structured thinking. If not, take these insights to the <strong>Emergency Chat</strong> tab and let AI help with the specific blocker you've identified.`;

    addActivity('🦆 Rubber Duck session complete — 4/4 questions answered');
}

function resetDuckSession() {
    document.getElementById('duckStart').style.display = 'flex';
    document.getElementById('duckConversation').style.display = 'none';
    document.getElementById('duckProblem').value = '';
    document.querySelectorAll('.duck-step').forEach(s => { s.classList.remove('active', 'done'); });
    document.getElementById('duckProgressFill').style.width = '0%';
    duckState = { step: 0, questions: [], problem: '' };
}

/* ==============================================
   GLOBAL UI HANDLERS
   ============================================== */

/* ── Chat Header Action Buttons (📞📹🖥️) + Attach ── */
function initChatHeaderActions() {
    document.querySelectorAll('.chat-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('title') || 'Action';
            showToast(`${title} connecting... (demo mode)`);
            addActivity(`📡 ${title} requested`);
        });
    });

    const attachBtn = document.querySelector('.attach-btn');
    if (attachBtn) {
        attachBtn.addEventListener('click', () => {
            showToast('File attachment — drag & drop or paste code directly into the chat');
            addActivity('📎 File attach triggered');
        });
    }
}

/* ── Knowledge Base Search ── */
function initKBSearch() {
    const input = document.querySelector('.kb-search-input');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        document.querySelectorAll('.kb-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = (!query || text.includes(query)) ? 'flex' : 'none';
        });
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const visible = document.querySelectorAll('.kb-item[style*="flex"], .kb-item:not([style])');
            showToast(`Knowledge Base: ${visible.length} result${visible.length !== 1 ? 's' : ''} found`);
        }
    });
}

/* ── Language Selector ── */
function initLanguageSelector() {
    const select = document.querySelector('.language-select');
    if (!select) return;

    select.addEventListener('change', () => {
        const lang = select.options[select.selectedIndex].text;
        showToast(`Language switched to ${lang} (demo mode)`);
        addActivity(`🌐 Language changed: ${lang}`);
    });
}
