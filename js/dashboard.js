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
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const msg = chip.dataset.msg;
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
