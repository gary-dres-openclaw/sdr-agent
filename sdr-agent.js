#!/usr/bin/env node

/**
 * SDR Agent - Self-Improving Sales Development Representative
 * NWA Automated
 * 
 * Usage: node sdr-agent.js [command] [options]
 * 
 * Commands:
 *   outreach    - Run outreach campaign
 *   log         - Log an outcome
 *   evolve      - Run evolution cycle
 *   status      - Show current stats
 */

const fs = require('fs');
const path = require('path');

// Config paths
const CONFIG_DIR = path.join(__dirname, 'config');
const HISTORY_FILE = path.join(__dirname, 'history.jsonl');
const CONFIG_FILE = path.join(CONFIG_DIR, 'active.json');

// Default config
const DEFAULT_CONFIG = {
  version: 1,
  subjectLineStyle: 'question', // question, statement, challenge
  emailLength: 'short', // short (<50 words), medium (50-100), long (100+)
  sendTime: 'morning', // morning (8-11), afternoon (1-4), evening (5-8)
  followUpDelay: 3, // days
  offerFraming: 'problem', // problem, proof, social
  minLeadScore: 50, // only contact leads above this
  maxEmailsPerDay: 20,
  active: true
};

// Ensure directories exist
function init() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '');
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
}

// Load current config
function getConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Subject line generators
const subjectLines = {
  question: [
    "Quick question about {company}",
    "{name} - one question",
    "Do you have 30 seconds?",
    "What's your biggest challenge with {pain}?"
  ],
  statement: [
    "{company} + Google = more leads",
    "You're missing {number} leads/month",
    "{company} - missed opportunity"
  ],
  challenge: [
    "Can you solve this problem?",
    "Want to fix your {pain}?",
    "Stop losing {number} leads/month"
  ]
};

// Body templates
const emailTemplates = {
  short: "Hey {name},\n\n{hook}\n\n{cta}\n\n- Andre",
  medium: "Hey {name},\n\n{hook}\n\n{body}\n\n{cta}\n\nAndre\nNWA Automated",
  long: "Hey {name},\n\n{intro}\n\n{body}\n\n{socialProof}\n\n{cta}\n\nBest,\nAndre Brassfield\nFounder, NWA Automated"
};

// Send email via gws (placeholder - integrate with actual gws CLI)
async function sendEmail(to, subject, body) {
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${body.substring(0, 100)}...`);
  // Actual send: gws gmail +send --to "$to" --subject "$subject" --body "$body"
  return { success: true, messageId: `msg-${Date.now()}` };
}

// Log outcome to history
function logOutcome(leadId, outcome, metadata = {}) {
  const record = {
    id: leadId,
    outcome,
    timestamp: new Date().toISOString(),
    config: getConfig(),
    ...metadata
  };
  fs.appendFileSync(HISTORY_FILE, JSON.stringify(record) + '\n');
  console.log(`[LOG] ${leadId}: ${outcome}`);
}

// Run outreach
async function runOutreach(leadsFile) {
  const config = getConfig();
  if (!config.active) {
    console.log('[OUTREACH] Agent is inactive. Run `evolve` to optimize.');
    return;
  }
  
  console.log('[OUTREACH] Starting campaign with config:', JSON.stringify(config, null, 2));
  
  // Load leads (CSV format expected)
  // For now, generate sample
  const leads = [
    { id: 'lead-001', name: 'Ronnie', company: 'Logistics Warehouse', email: 'rrobertson@logistics-warehouse.com' },
    { id: 'lead-002', name: 'Don', company: 'Carman Inc', email: 'greg@carmaninc.com' }
  ];
  
  let sent = 0;
  for (const lead of leads) {
    if (sent >= config.maxEmailsPerDay) break;
    
    const subjectGen = subjectLines[config.subjectLineStyle];
    const subject = subjectGen[Math.floor(Math.random() * subjectGen.length)]
      .replace('{company}', lead.company)
      .replace('{name}', lead.name)
      .replace('{pain}', 'lead generation')
      .replace('{number}', '15-20');
    
    const bodyGen = emailTemplates[config.emailLength];
    const body = bodyGen
      .replace('{name}', lead.name)
      .replace('{company}', lead.company)
      .replace('{hook}', "Saw you're losing leads every month to competitors who show up on Google.")
      .replace('{cta}', "Worth a 10-min demo?")
      .replace('{body}', "Most contractors we talk to don't realize they're invisible to potential customers searching online.")
      .replace('{intro}', "I've been helping NWA businesses automate their outreach.");
    
    await sendEmail(lead.email, subject, body);
    logOutcome(lead.id, 'sent', { email: lead.email, subject });
    sent++;
  }
  
  console.log(`[OUTREACH] Sent ${sent} emails`);
}

// Evolution - generate candidates, test, promote
async function evolve() {
  console.log('[EVOLVE] Starting evolution cycle...');
  
  const history = readHistory();
  const currentConfig = getConfig();
  
  if (history.length < 5) {
    console.log('[EVOLVE] Need more data. Log more outcomes first.');
    return;
  }
  
  // Generate 20 candidates
  const candidates = generateCandidates(currentConfig, 20);
  
  // Score each candidate
  const scored = candidates.map(cand => ({
    config: cand,
    score: backtest(cand, history)
  }));
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  console.log('[EVOLVE] Top candidates:');
  scored.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i+1}. Score: ${s.score.toFixed(3)}`);
  });
  
  // Promote winner if it passes gates
  const winner = scored[0];
  if (winner.score > currentConfig._lastScore || !currentConfig._lastScore) {
    console.log('[EVOLVE] Promoting winner!');
    saveConfig({ ...winner.config, _lastScore: winner.score, _promoted: new Date().toISOString() });
  } else {
    console.log('[EVOLVE] Winner did not pass gates. Keeping current config.');
  }
}

// Generate config variations
function generateCandidates(base, count) {
  const candidates = [];
  const options = {
    subjectLineStyle: ['question', 'statement', 'challenge'],
    emailLength: ['short', 'medium', 'long'],
    sendTime: ['morning', 'afternoon', 'evening'],
    followUpDelay: [1, 3, 5, 7],
    offerFraming: ['problem', 'proof', 'social']
  };
  
  for (let i = 0; i < count; i++) {
    const candidate = { ...base };
    for (const [key, vals] of Object.entries(options)) {
      if (Math.random() > 0.5) {
        candidate[key] = vals[Math.floor(Math.random() * vals.length)];
      }
    }
    candidates.push(candidate);
  }
  return candidates;
}

// Backtest a config against history
function backtest(config, history) {
  let truePos = 0, falsePos = 0, missed = 0;
  
  for (const item of history) {
    if (item.outcome === 'sent') continue; // Skip sent
    
    const flagged = item.config && 
      item.config.subjectLineStyle === config.subjectLineStyle &&
      item.config.emailLength === config.emailLength;
    
    if (flagged && (item.outcome === 'reply' || item.outcome === 'booked' || item.outcome === 'closed')) {
      truePos++;
    } else if (flagged && (item.outcome === 'silence' || item.outcome === 'bounce' || item.outcome === 'unsubscribe')) {
      falsePos++;
    } else if (!flagged && (item.outcome === 'reply' || item.outcome === 'booked')) {
      missed++;
    }
  }
  
  if (truePos + falsePos === 0) return 0.5;
  if (truePos + missed === 0) return 0;
  
  const precision = truePos / (truePos + falsePos);
  const recall = truePos / (truePos + missed);
  
  return 0.5 * precision + 0.3 * recall + 0.2 * (1 - falsePos / history.length);
}

// Read history
function readHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  const data = fs.readFileSync(HISTORY_FILE, 'utf8');
  return data.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
}

// Show status
function showStatus() {
  const config = getConfig();
  const history = readHistory();
  
  console.log('\n=== SDR Agent Status ===');
  console.log('Config:', JSON.stringify(config, null, 2));
  console.log('\nHistory:');
  console.log('  Total entries:', history.length);
  console.log('  By outcome:');
  
  const counts = {};
  history.forEach(h => { counts[h.outcome] = (counts[h.outcome] || 0) + 1; });
  Object.entries(counts).forEach(([k, v]) => console.log(`    ${k}: ${v}`));
}

// Main
const args = process.argv.slice(2);
const command = args[0];

init();

switch (command) {
  case 'outreach':
    runOutreach(args[1]);
    break;
  case 'log':
    logOutcome(args[1], args[2], JSON.parse(args[3] || '{}'));
    break;
  case 'evolve':
    evolve();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('SDR Agent v1.0');
    console.log('Usage: node sdr-agent.js [command]');
    console.log('Commands: outreach, log, evolve, status');
}
