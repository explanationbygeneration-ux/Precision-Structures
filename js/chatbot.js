/* ============================================================
   Precision Structures Inc. — AI Chatbot (Claude-powered)
   ============================================================
   This chatbot uses the Anthropic Claude API to provide
   intelligent responses about Precision Structures' services.

   SETUP: Replace ANTHROPIC_API_KEY with your actual key, or
   connect this to a backend proxy to keep the key secure.
   ============================================================ */

const CHATBOT_CONFIG = {
  companyName: 'Precision Structures Inc.',
  systemPrompt: `You are a helpful assistant for Precision Structures Inc., a family-owned truss manufacturing company in Hooper, Utah (est. 1990).

KEY COMPANY INFO:
- Services: Roof trusses, floor trusses, custom roof design
- Location: 5333 S. 5500 W., Hooper, UT 84315
- Phone: (801) 985-3000
- Bids email: bids@precisionstructures.net
- General email: contact@precisionstructures.net
- Hours: Monday-Friday 8am-4pm, Closed weekends
- Service area: Utah, Idaho, Wyoming, Colorado, Nevada, Montana (Rocky Mountain region)
- Family owned and operated since 1990
- Process: Send plans → We design & quote → We manufacture → Delivered to you

TRUSS KNOWLEDGE:
- Top Chord: inclined/horizontal upper member (compression + bending)
- Bottom Chord: lower horizontal member (tension)
- Web Members: interior diagonal/vertical members creating triangulation
- King Post: central vertical from apex to bottom chord
- Pitch: roof slope as rise/run (e.g. 4/12 = 4" rise per 12" run)
- Span: horizontal distance between bearing points
- Connector Plate: metal plates pressed into joints
- Common pitches: 2/12 to 12/12
- Floor trusses allow easy MEP routing with open-web design

BEHAVIOR:
- Be friendly, professional, and concise
- For bid requests, direct them to email plans to bids@precisionstructures.net or call (801) 985-3000
- For employment, direct to contact@precisionstructures.net
- You can answer general questions about trusses, building, and our services
- If unsure about specific pricing, say estimates vary and recommend contacting us directly
- Never make up specific prices — direct to our team for accurate bids
- Keep responses under 150 words unless the question requires detail`,
  welcomeMessage: "Welcome to Precision Structures! I'm your AI assistant powered by Claude. I can help you with:\n\n- Questions about our truss services\n- Understanding truss terminology\n- Starting a bid request\n- Finding our contact info\n\nHow can I help you today?",
  suggestions: [
    'What services do you offer?',
    'How do I request a bid?',
    'What areas do you serve?',
    'Explain truss terminology'
  ]
};

class PrecisionChatbot {
  constructor() {
    this.messages = [];
    this.isOpen = false;
    this.isTyping = false;
    this.init();
  }

  init() {
    this.injectHTML();
    this.bindEvents();
    this.addBotMessage(CHATBOT_CONFIG.welcomeMessage);
  }

  injectHTML() {
    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'chatbot-toggle';
    toggle.id = 'chatbot-toggle';
    toggle.setAttribute('aria-label', 'Open chat assistant');
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <span class="badge">AI</span>
    `;
    document.body.appendChild(toggle);

    // Chat window
    const win = document.createElement('div');
    win.className = 'chatbot-window';
    win.id = 'chatbot-window';
    win.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-left">
          <div class="chatbot-header-avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div class="chatbot-header-info">
            <h4>Precision AI Assistant</h4>
            <span>Powered by Claude</span>
          </div>
        </div>
        <button class="chatbot-close" id="chatbot-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-suggestions" id="chatbot-suggestions"></div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbot-input"
               placeholder="Ask about trusses, bids, services..."
               autocomplete="off"/>
        <button class="chatbot-send" id="chatbot-send">Send</button>
      </div>
    `;
    document.body.appendChild(win);

    // Add suggestions
    this.renderSuggestions();
  }

  renderSuggestions() {
    const container = document.getElementById('chatbot-suggestions');
    container.innerHTML = '';
    CHATBOT_CONFIG.suggestions.forEach(text => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.addEventListener('click', () => this.sendMessage(text));
      container.appendChild(btn);
    });
  }

  bindEvents() {
    document.getElementById('chatbot-toggle').addEventListener('click', () => this.toggle());
    document.getElementById('chatbot-close').addEventListener('click', () => this.close());
    document.getElementById('chatbot-send').addEventListener('click', () => this.handleSend());
    document.getElementById('chatbot-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.handleSend();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('chatbot-window').classList.toggle('open', this.isOpen);
    if (this.isOpen) {
      document.getElementById('chatbot-input').focus();
    }
  }

  close() {
    this.isOpen = false;
    document.getElementById('chatbot-window').classList.remove('open');
  }

  handleSend() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    if (!text || this.isTyping) return;
    input.value = '';
    this.sendMessage(text);
  }

  async sendMessage(text) {
    // Add user message
    this.addMessage('user', text);
    this.messages.push({ role: 'user', content: text });

    // Hide suggestions after first message
    document.getElementById('chatbot-suggestions').style.display = 'none';

    // Show typing indicator
    this.showTyping();

    try {
      const response = await this.getAIResponse(text);
      this.hideTyping();
      this.addBotMessage(response);
      this.messages.push({ role: 'assistant', content: response });
    } catch (err) {
      this.hideTyping();
      this.addBotMessage(this.getFallbackResponse(text));
    }
  }

  async getAIResponse(userMessage) {
    // Try Claude API first (requires backend proxy for security)
    // In production, route through your own backend to protect the API key
    const proxyUrl = window.CHATBOT_API_URL || null;

    if (proxyUrl) {
      try {
        const resp = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: this.messages.concat([{ role: 'user', content: userMessage }]),
            system: CHATBOT_CONFIG.systemPrompt,
            max_tokens: 300
          })
        });
        const data = await resp.json();
        if (data.content && data.content[0]) {
          return data.content[0].text;
        }
      } catch (e) {
        console.log('API unavailable, using fallback responses');
      }
    }

    // Intelligent fallback using keyword matching
    return this.getFallbackResponse(userMessage);
  }

  getFallbackResponse(text) {
    const lower = text.toLowerCase();

    // Services
    if (lower.includes('service') || lower.includes('offer') || lower.includes('what do you')) {
      return "We offer three core services:\n\n1. **Roof Trusses** — Precision-engineered for residential and commercial builds\n2. **Floor Trusses** — Open-web design for easy MEP routing\n3. **Custom Design** — Complex geometries, steep pitches, long spans\n\nSend your blueprints to bids@precisionstructures.net for a free quote!";
    }

    // Bid / Quote / Price
    if (lower.includes('bid') || lower.includes('quote') || lower.includes('price') || lower.includes('cost') || lower.includes('estimate')) {
      return "To get a bid, you can:\n\n1. **Email your plans** to bids@precisionstructures.net\n2. **Call us** at (801) 985-3000\n3. **Use our contact form** on the Contact page\n\nInclude your span, pitch, quantity, and delivery location for the fastest quote. You can also try our AI Estimate Calculator on the Resources page for a rough ballpark!";
    }

    // Area / Location / Delivery
    if (lower.includes('area') || lower.includes('deliver') || lower.includes('where') || lower.includes('location') || lower.includes('serve')) {
      return "We're located in **Hooper, Utah** (5333 S. 5500 W., Hooper, UT 84315) and deliver across the Rocky Mountain region:\n\n- Utah\n- Idaho\n- Wyoming\n- Colorado\n- Nevada\n- Montana\n\nCall (801) 985-3000 to confirm delivery to your area!";
    }

    // Contact / Phone / Email
    if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call') || lower.includes('reach')) {
      return "Here's how to reach us:\n\n- **Phone:** (801) 985-3000\n- **Bids:** bids@precisionstructures.net\n- **General:** contact@precisionstructures.net\n- **Address:** 5333 S. 5500 W., Hooper, UT 84315\n- **Hours:** Mon-Fri 8am-4pm";
    }

    // Hours
    if (lower.includes('hour') || lower.includes('open') || lower.includes('close') || lower.includes('when')) {
      return "Our business hours are **Monday through Friday, 8am to 4pm**. We're closed on weekends. Give us a call at (801) 985-3000 during business hours!";
    }

    // Terminology / Truss parts
    if (lower.includes('terminolog') || lower.includes('truss') || lower.includes('chord') || lower.includes('pitch') || lower.includes('span') || lower.includes('web')) {
      return "Here are key truss terms:\n\n- **Top Chord:** Upper inclined member (compression)\n- **Bottom Chord:** Lower horizontal member (tension)\n- **Web Members:** Interior triangulated members\n- **King Post:** Central vertical from peak to bottom chord\n- **Pitch:** Roof slope (e.g., 4/12 = 4\" rise per 12\" run)\n- **Span:** Distance between bearing points\n\nCheck our Resources page for the full glossary and interactive diagram!";
    }

    // Employment / Jobs
    if (lower.includes('job') || lower.includes('employ') || lower.includes('hiring') || lower.includes('work') || lower.includes('career') || lower.includes('resume')) {
      return "Interested in joining our team? Email your resume to **contact@precisionstructures.net** and we'll be in touch. We're always looking for dedicated people who share our passion for quality craftsmanship!";
    }

    // About / History
    if (lower.includes('about') || lower.includes('history') || lower.includes('family') || lower.includes('story') || lower.includes('who')) {
      return "Precision Structures has been **family-owned and operated since 1990**. We started in Hooper, Utah with a small team and big dreams. Over 35 years later, we still give every customer the personal attention that only a family business can deliver. Our passion is helping people build their homes with precision-engineered truss systems.";
    }

    // Process / How
    if (lower.includes('process') || lower.includes('how does') || lower.includes('how do') || lower.includes('steps')) {
      return "Our process is simple:\n\n1. **Send Your Plans** — Email blueprints to bids@precisionstructures.net\n2. **We Design & Quote** — Our engineers create a custom truss system with a clear bid\n3. **We Manufacture** — Built at our Hooper, UT facility with precision\n4. **Delivered to You** — On schedule across the Rocky Mountain region\n\nIt's that easy!";
    }

    // Greeting
    if (lower.match(/^(hi|hello|hey|good|howdy|greetings)/)) {
      return "Hello! Welcome to Precision Structures. I'm here to help with questions about our truss services, getting a bid, or anything else. What can I help you with?";
    }

    // Thanks
    if (lower.match(/(thank|thanks|thx|appreciate)/)) {
      return "You're welcome! If you need anything else, don't hesitate to ask. You can also reach us directly at (801) 985-3000 or bids@precisionstructures.net. We're here to help!";
    }

    // Default
    return "Great question! For the most accurate answer, I'd recommend:\n\n- **Call us:** (801) 985-3000\n- **Email:** contact@precisionstructures.net\n\nI can also help with questions about our services, truss terminology, the bid process, or our service area. What would you like to know?";
  }

  addMessage(type, text) {
    const container = document.getElementById('chatbot-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.innerHTML = this.formatMessage(text);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  addBotMessage(text) {
    this.addMessage('bot', text);
  }

  formatMessage(text) {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  showTyping() {
    this.isTyping = true;
    const container = document.getElementById('chatbot-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot typing';
    msg.id = 'typing-indicator';
    msg.innerHTML = '<span class="typing-dots">Thinking</span>';
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    // Animate dots
    let dots = 0;
    this.typingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      const el = document.getElementById('typing-indicator');
      if (el) el.querySelector('.typing-dots').textContent = 'Thinking' + '.'.repeat(dots);
    }, 400);
  }

  hideTyping() {
    this.isTyping = false;
    clearInterval(this.typingInterval);
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.precisionChatbot = new PrecisionChatbot();
});
