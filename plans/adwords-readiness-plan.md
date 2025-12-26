# AdWords Readiness Implementation Plan

## Overview

This plan outlines the steps to prepare Seatify for a Google AdWords experiment to measure market interest. The goal is to implement reliable conversion tracking with minimal development effort before investing in a full-stack version.

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Core product | Ready | Optimization, drag-drop, QR codes, PDF export all working |
| Landing page | Ready | Clear value prop, visual demo, good copy |
| Primary CTA | Needs work | "Start Planning Free" bypasses email capture |
| Email capture | Weak | External Google Form - no conversion tracking possible |
| Analytics | Missing | Zero tracking implemented |
| Conversion tracking | Missing | Cannot attribute signups to ad campaigns |

---

## Phase 1: Analytics Foundation (Day 1)

### 1.1 Add Google Analytics 4

**Files to modify:**
- `index.html` - Add GA4 script tag
- `src/utils/analytics.ts` (new) - Analytics helper functions

**Implementation:**

1. Create GA4 property at https://analytics.google.com
2. Add gtag.js script to `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

3. Create analytics utility module:
   ```typescript
   // src/utils/analytics.ts
   export function trackEvent(eventName: string, params?: Record<string, unknown>) {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', eventName, params);
     }
   }
   ```

4. Add TypeScript declaration for gtag:
   ```typescript
   // src/types/gtag.d.ts
   declare global {
     interface Window {
       gtag: (...args: unknown[]) => void;
       dataLayer: unknown[];
     }
   }
   ```

### 1.2 Track Key User Events

**Events to track:**

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `page_view` | Route change | `page_path`, `page_title` |
| `event_created` | User creates new event | `event_type` (wedding, corporate, etc.) |
| `guest_added` | Guest added to event | `guest_count` |
| `table_added` | Table added to canvas | `table_shape` |
| `optimizer_run` | User runs seating optimizer | `guest_count`, `table_count` |
| `qr_generated` | QR code generated | `type` (share, table) |
| `pdf_exported` | PDF/cards exported | `export_type` |
| `email_signup` | User submits email | `source` (modal, landing) |

**Files to modify:**
- `src/store/useStore.ts` - Add tracking calls to actions
- `src/components/LandingPage.tsx` - Track landing page interactions
- `src/App.tsx` - Track page views on route change

---

## Phase 2: Email Capture System (Day 1-2)

### 2.1 Replace External Google Form

**Option A: Formspree (Recommended - Zero backend)**
- Free tier: 50 submissions/month
- Paid: $8/month for 1000 submissions
- No backend code required

**Option B: EmailOctopus + Embedded Form**
- Free tier: 2,500 subscribers
- Better for ongoing newsletter

**Option C: Cloudflare Pages Function**
- Already on Cloudflare Pages
- Add a `/functions/subscribe.ts` endpoint
- Store in KV or forward to email service

### 2.2 Create In-App Email Capture Modal

**New file:** `src/components/EmailCaptureModal.tsx`

```typescript
interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: 'save_prompt' | 'export_prompt' | 'landing';
}
```

**Trigger points:**
1. After user adds 5+ guests (soft prompt)
2. When user attempts to export/share (optional gate)
3. Landing page "Subscribe" section (replace external link)

### 2.3 Smart Capture Strategy

Instead of blocking users upfront, use a value-first approach:

```
User enters app freely
        ↓
Uses app, adds guests, creates tables
        ↓
Reaches "value moment" (5+ guests OR runs optimizer)
        ↓
Show non-blocking modal:
  "Save your seating chart"
  "Enter your email to get a link to your chart"
  [Email input] [Save & Continue]
  [Maybe later]
        ↓
Track conversion event
```

**Files to create/modify:**
- `src/components/EmailCaptureModal.tsx` (new)
- `src/components/EmailCaptureModal.css` (new)
- `src/store/useStore.ts` - Add `hasShownEmailPrompt` state
- `src/components/LandingPage.tsx` - Replace external form link

---

## Phase 3: Conversion Tracking (Day 2)

### 3.1 Google Ads Conversion Setup

1. Create conversion action in Google Ads:
   - Conversion name: "Email Signup"
   - Category: "Lead"
   - Value: Set based on expected LTV

2. Get conversion tracking code and add to success handler:
   ```typescript
   // After successful email submission
   gtag('event', 'conversion', {
     'send_to': 'AW-XXXXXXXXX/XXXXXXXXXXXXXX',
     'value': 1.0,
     'currency': 'USD'
   });
   ```

### 3.2 UTM Parameter Tracking

Capture UTM parameters on landing page and persist through session:

**New file:** `src/utils/utm.ts`

```typescript
export function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };

  // Store in sessionStorage for attribution
  if (Object.values(utmParams).some(v => v)) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
}

export function getUtmParams(): Record<string, string | null> {
  const stored = sessionStorage.getItem('utm_params');
  return stored ? JSON.parse(stored) : {};
}
```

Include UTM params with email signup for attribution.

---

## Phase 4: Landing Page Optimization (Day 2)

### 4.1 Update Email Capture Section

**Current (external link):**
```tsx
<a href="https://docs.google.com/forms/d/e/...">Subscribe for Updates</a>
```

**Updated (inline form):**
```tsx
<form onSubmit={handleEmailSubmit} className="email-form">
  <input
    type="email"
    placeholder="your@email.com"
    required
  />
  <button type="submit">Subscribe for Updates</button>
</form>
```

### 4.2 Add Secondary CTA Option

Consider A/B testing two flows:
- **Flow A (current):** "Start Planning Free" → Direct to app
- **Flow B (gated):** "Start Planning Free" → Email capture → App

Track which converts better for actual engagement.

---

## Implementation Checklist

### Day 1: Analytics
- [ ] Create GA4 property
- [ ] Add gtag.js to index.html
- [ ] Create `src/utils/analytics.ts`
- [ ] Create `src/types/gtag.d.ts`
- [ ] Add page view tracking to router
- [ ] Add event tracking to key actions (event_created, guest_added, optimizer_run)
- [ ] Test analytics in GA4 real-time view

### Day 2: Email Capture
- [ ] Choose email service (Formspree recommended for speed)
- [ ] Create EmailCaptureModal component
- [ ] Add modal trigger after value moments
- [ ] Replace landing page external form with inline form
- [ ] Add UTM capture utility
- [ ] Set up Google Ads conversion tracking
- [ ] Include UTM params in email submissions

### Pre-Launch Validation
- [ ] Verify GA4 receiving events
- [ ] Test email submission flow end-to-end
- [ ] Confirm conversion tracking fires on signup
- [ ] Test UTM parameter persistence
- [ ] Review mobile experience for email capture

---

## Success Metrics

Once live, track these KPIs:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Landing → App entry | >60% | GA4 funnel |
| App entry → Value moment | >40% | GA4 events |
| Value moment → Email signup | >15% | Conversion rate |
| Cost per email signup | <$5 | Google Ads |
| Email → Return visit | >20% | GA4 cohorts |

---

## Decision Point

After 2-4 weeks of AdWords testing with $500-1000 budget:

**If CPL < $5 and volume exists:**
→ Proceed with full-stack development (auth, persistent storage, RSVP integrations)

**If CPL > $10 or low volume:**
→ Pivot messaging, try different audiences, or reconsider product direction

**If CPL $5-10:**
→ Optimize landing page and email capture before scaling

---

## Future Full-Stack Features (Post-Validation)

Only build these after validating demand:

1. **User Authentication**
   - Email/password + OAuth (Google)
   - Persistent event storage

2. **Collaboration**
   - Share events with co-planners
   - Real-time editing (optional)

3. **RSVP Integrations**
   - Zola API integration
   - The Knot import
   - Eventbrite webhook

4. **AI-Powered Seating**
   - Advanced optimization algorithms
   - Relationship inference from guest data

---

## Files to Create/Modify Summary

**New files:**
- `src/utils/analytics.ts`
- `src/utils/utm.ts`
- `src/types/gtag.d.ts`
- `src/components/EmailCaptureModal.tsx`
- `src/components/EmailCaptureModal.css`

**Modified files:**
- `index.html` - GA4 script
- `src/App.tsx` - Page view tracking
- `src/store/useStore.ts` - Event tracking + email prompt state
- `src/components/LandingPage.tsx` - Inline email form

**Estimated effort:** 1-2 days for a developer familiar with the codebase.
