# SDR Agent v1.0 - NWA Automated

## Identity
- **Name:** SDR Agent (Sales Development Representative)
- **Version:** 1.0.0
- **Purpose:** Autonomous lead outreach, qualification, and appointment setting
- **Owner:** NWA Automated

## Core Functions
1. **Lead Research** - Find contact info, verify data
2. **Outreach** - Send personalized emails/SMS/LinkedIn
3. **Qualification** - Score leads, identify hot prospects
4. **Booking** - Schedule discovery calls

## Skills (API-Optimized)

### skill: email_outreach
- Uses gws gmail API for sending
- Tracks opens/clicks
- A/B tests subject lines
- Rate limiting: 50/day max

### skill: lead_research
- Brave Search API for email finding
- LinkedIn scraping (v3_shielded_outreach)
- Apollo/Hunter enrichment

### skill: crm_update
- Logs to Google Sheets
- Tracks pipeline stage
- Updates lead scores

### skill: calendar_booking
- Finds open slots
- Sends calendar invites
- Confirmation follow-ups

## Self-Improvement System

### The Feedback Loop
Every outreach outcome gets logged:
- `reply` - Lead responded
- `booked` - Call scheduled
- `closed` - Deal won
- `bounce` - Invalid email
- `unsubscribe` - Opted out
- `silence` - No response

### Evolution Engine
See `/evolution/` for the optimization system that:
1. Generates 20 config variations per cycle
2. Backtests against history
3. Promotes winner if it passes gates

### Config Tunables
```json
{
  "subjectLineStyle": "question|statement|challenge",
  "emailLength": "short|medium|long",
  "sendTime": "morning|afternoon|evening",
  "followUpDelay": "1|3|7",
  "offerFraming": "problem|proof|social"
}
```

## Usage

```bash
# Run outreach
sdr-agent --action outreach --leads leads.csv

# Log outcome
sdr-agent --action log --lead lead-001 --outcome booked

# Trigger evolution
sdr-agent --action evolve
```

## Clone & Sell

This agent is designed to be:
1. **Forkable** - Clone the repo, change config
2. **Self-improving** - Gets smarter over time
3. **White-label** - Swap branding, own it
4. **Profitable** - Use for clients or sell the agent

### Sell the Agent
- Package as "SDR Bot v1.0"
- Clients pay $X00/mo for lead generation
- You keep improving, they keep benefiting

---

*SDR Agent - Built by Circuit for NWA Automated*
*Self-improving via evolution engine*
