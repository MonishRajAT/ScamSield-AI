'use strict';

/* =========================================================
   Config — change the backend URL in this one place
   ========================================================= */
const API_BASE_URL = 'http://127.0.0.1:8000';
const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/analyze`;
const MAX_MESSAGE_LENGTH = 5000;

/* =========================================================
   Example messages
   ========================================================= */
const EXAMPLE_MESSAGES = {
  safe: 'Hey, are you coming to class tomorrow?',
  suspicious: 'Congratulations! You have won a free gift. Call now to claim it.',
  'high-risk': 'Your bank account has been suspended. Verify immediately.',
};

/* =========================================================
   Risk level display metadata (icons + labels only —
   no backend data is invented here)
   ========================================================= */
const RISK_META = {
  safe: {
    label: 'Safe',
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 2.5L4 5.5V11c0 5.25 3.36 9.86 8 11 4.64-1.14 8-5.75 8-11V5.5L12 2.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.7 12.1l2.2 2.2 4.4-4.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  suspicious: {
    label: 'Suspicious',
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 2.5L4 5.5V11c0 5.25 3.36 9.86 8 11 4.64-1.14 8-5.75 8-11V5.5L12 2.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 8.5v4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="15.6" r="0.95" fill="currentColor"/></svg>`,
  },
  'high-risk': {
    label: 'High-risk',
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 2.5L4 5.5V11c0 5.25 3.36 9.86 8 11 4.64-1.14 8-5.75 8-11V5.5L12 2.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  },
};

/* =========================================================
   DOM references
   ========================================================= */
const form = document.getElementById('analyzer-form');
const messageInput = document.getElementById('message-input');
const charCounter = document.getElementById('char-counter');
const validationMessage = document.getElementById('validation-message');
const analyzeBtn = document.getElementById('analyze-btn');
const statusMessage = document.getElementById('status-message');
const exampleChips = document.querySelectorAll('[data-example]');

const errorSection = document.getElementById('error-section');
const errorText = document.getElementById('error-text');

const heroCta = document.getElementById('hero-cta');
const howItWorksLink = document.getElementById('how-it-works-link');

const resultsSection = document.getElementById('results');
const riskPanel = document.getElementById('risk-panel');
const riskIcon = document.getElementById('risk-icon');
const riskLevelText = document.getElementById('risk-level-text');
const confidenceValue = document.getElementById('confidence-value');
const probabilityList = document.getElementById('probability-list');
const explanationSummary = document.getElementById('explanation-summary');
const signalsList = document.getElementById('signals-list');
const scamTypeBadge = document.getElementById('scam-type-badge');
const actionsPanel = document.getElementById('actions-panel');
const actionsList = document.getElementById('actions-list');
const originalMessage = document.getElementById('original-message');
const resetBtn = document.getElementById('reset-btn');

let isSubmitting = false;
let statusMessageTimeouts = [];

/* =========================================================
   Validation
   ========================================================= */
function validateMessage(rawValue) {
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Please enter a message to analyze.' };
  }
  if (rawValue.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` };
  }
  return { valid: true, value: trimmed };
}

/* =========================================================
   UI state helpers
   ========================================================= */
function updateCharCounter() {
  const length = messageInput.value.length;
  charCounter.textContent = `${length} / ${MAX_MESSAGE_LENGTH}`;
  charCounter.classList.toggle('is-near-limit', length > MAX_MESSAGE_LENGTH * 0.9);
}

function clearValidationError() {
  validationMessage.textContent = '';
  messageInput.classList.remove('is-invalid');
  messageInput.removeAttribute('aria-invalid');
}

function showValidationError(message) {
  validationMessage.textContent = message;
  messageInput.classList.add('is-invalid');
  messageInput.setAttribute('aria-invalid', 'true');
}

function hideError() {
  errorSection.hidden = true;
  errorText.textContent = '';
}

function showError(message) {
  hideResults();
  errorText.textContent = message;
  errorSection.hidden = false;
  errorSection.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}

function hideResults() {
  resultsSection.hidden = true;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clearStatusTimeouts() {
  statusMessageTimeouts.forEach((id) => clearTimeout(id));
  statusMessageTimeouts = [];
}

function showLoading() {
  isSubmitting = true;
  hideError();
  hideResults();

  analyzeBtn.disabled = true;
  analyzeBtn.classList.add('is-loading');
  analyzeBtn.querySelector('.btn-primary__label').textContent = 'Analyzing…';

  clearStatusTimeouts();
  statusMessage.textContent = 'Inspecting message patterns…';
  statusMessageTimeouts.push(
    setTimeout(() => {
      if (isSubmitting) {
        statusMessage.textContent = 'Generating explanation…';
      }
    }, 1400)
  );
}

function stopLoading() {
  isSubmitting = false;
  clearStatusTimeouts();

  analyzeBtn.disabled = false;
  analyzeBtn.classList.remove('is-loading');
  analyzeBtn.querySelector('.btn-primary__label').textContent = 'Analyze message';
  statusMessage.textContent = '';
}

/* =========================================================
   Rendering
   ========================================================= */
function renderRisk(riskLevel, confidence) {
  const meta = RISK_META[riskLevel] || {
    label: riskLevel,
    icon: RISK_META.suspicious.icon,
  };

  riskPanel.dataset.risk = RISK_META[riskLevel] ? riskLevel : 'suspicious';
  riskIcon.innerHTML = meta.icon;
  riskLevelText.textContent = meta.label;
  confidenceValue.textContent = `${(confidence * 100).toFixed(2)}%`;
}

function renderProbabilities(probabilities) {
  probabilityList.innerHTML = '';

  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  const topKey = entries.length > 0 ? entries[0][0] : null;

  entries.forEach(([key, value]) => {
    const li = document.createElement('li');
    li.className = 'probability-row';
    li.dataset.key = key;
    if (key === topKey) li.classList.add('is-top');

    const percent = (value * 100).toFixed(2);

    const top = document.createElement('div');
    top.className = 'probability-row__top';

    const name = document.createElement('span');
    name.className = 'probability-row__name';
    name.textContent = key;

    const val = document.createElement('span');
    val.className = 'probability-row__value';
    val.textContent = `${percent}%`;

    top.appendChild(name);
    top.appendChild(val);

    const track = document.createElement('div');
    track.className = 'probability-track';

    const fill = document.createElement('div');
    fill.className = 'probability-fill';
    track.appendChild(fill);

    li.appendChild(top);
    li.appendChild(track);
    probabilityList.appendChild(li);

    // Animate width on next frame so the transition is visible.
    requestAnimationFrame(() => {
      fill.style.width = `${percent}%`;
    });
  });
}

function renderExplanation(explanation) {
  explanationSummary.textContent = explanation.summary || '';

  signalsList.innerHTML = '';
  (explanation.why_flagged || []).forEach((signal) => {
    const li = document.createElement('li');
    li.textContent = signal;
    signalsList.appendChild(li);
  });

  scamTypeBadge.textContent = explanation.scam_type || 'Unclassified';
}

function renderRecommendations(explanation, riskLevel) {
  actionsList.innerHTML = '';
  (explanation.recommended_actions || []).forEach((action) => {
    const li = document.createElement('li');
    li.textContent = action;
    actionsList.appendChild(li);
  });

  actionsPanel.dataset.emphasized = riskLevel === 'high-risk' ? 'true' : 'false';
}

function renderResult(data) {
  renderRisk(data.risk_level, data.confidence);
  renderProbabilities(data.probabilities);
  renderExplanation(data.explanation);
  renderRecommendations(data.explanation, data.risk_level);
  originalMessage.textContent = data.message;

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/* =========================================================
   API
   ========================================================= */
async function analyzeMessage(message) {
  let response;

  try {
    response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch (networkError) {
    throw new Error('Unable to connect to ScamShield. Make sure the backend is running.');
  }

  if (!response.ok) {
    throw new Error(messageForStatus(response.status));
  }

  return response.json();
}

function messageForStatus(status) {
  switch (status) {
    case 400:
      return 'Please enter a valid message.';
    case 422:
      return 'Please check the message and try again.';
    case 502:
      return "ScamShield couldn't complete the analysis right now. Please try again.";
    case 500:
      return 'Something went wrong. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/* =========================================================
   Reset
   ========================================================= */
function resetAnalysis() {
  hideResults();
  hideError();
  messageInput.value = '';
  updateCharCounter();
  clearValidationError();
  messageInput.focus();
}

/* =========================================================
   Event wiring
   ========================================================= */
messageInput.addEventListener('input', () => {
  updateCharCounter();
  if (validationMessage.textContent) clearValidationError();
});

exampleChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const key = chip.dataset.example;
    messageInput.value = EXAMPLE_MESSAGES[key] || '';
    updateCharCounter();
    clearValidationError();
    messageInput.focus();
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isSubmitting) return;

  const { valid, value, error } = validateMessage(messageInput.value);

  if (!valid) {
    showValidationError(error);
    return;
  }

  clearValidationError();
  showLoading();

  try {
    const data = await analyzeMessage(value);
    stopLoading();
    renderResult(data);
  } catch (err) {
    stopLoading();
    showError(err.message || 'Something went wrong. Please try again.');
  }
});

resetBtn.addEventListener('click', resetAnalysis);

heroCta.addEventListener('click', () => {
  document.getElementById('analyzer').scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
  // Give the scroll a moment to land before moving focus.
  setTimeout(() => messageInput.focus(), prefersReducedMotion() ? 0 : 450);
});

howItWorksLink.addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('how-it-works').scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
});

// Initialize counter on load.
updateCharCounter();