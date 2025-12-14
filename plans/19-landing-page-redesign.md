# Landing Page Redesign

## Overview

Transform the landing page from internal beta testing focus to public-ready, benefit-driven marketing page that appeals to multiple event planning markets.

## Current State Problems

| Issue | Current | Problem |
|-------|---------|---------|
| Beta badge | "Internal Beta" | Signals unfinished product |
| Description | "Test build for internal feedback" | Not benefit-driven |
| Section header | "What to Test" | Testing language, not value language |
| Feature cards | Technical focus (Canvas Interaction, etc.) | Describes mechanics, not outcomes |
| Meta tags | Title: "TableCraft" only | No SEO, poor social previews |
| Email capture | None | No way to measure interest |
| Trust signals | None | No privacy or credibility messaging |

## New Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        TableCraft                           │
│                  Event Seating Made Simple                  │
│                                                             │
│   Design floor plans, manage guest lists, and let smart    │
│   optimization handle the tricky seating decisions.        │
│                                                             │
│              [ Start Planning Free ]                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Smart   │  │  Visual  │  │  Works   │                  │
│  │ Seating  │  │  Floor   │  │ Anywhere │                  │
│  │          │  │  Plans   │  │          │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
├─────────────────────────────────────────────────────────────┤
│   Perfect for: Weddings · Corporate · Galas · Parties      │
├─────────────────────────────────────────────────────────────┤
│                    [Animated Demo]                          │
├─────────────────────────────────────────────────────────────┤
│                      Coming Soon                            │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │  AI-Powered       │  │  Guest Import     │              │
│  │  Seating          │  │  & RSVP           │              │
│  └───────────────────┘  └───────────────────┘              │
├─────────────────────────────────────────────────────────────┤
│   Stay in the loop                                          │
│   [email@example.com] [Subscribe]                           │
├─────────────────────────────────────────────────────────────┤
│   What's New    v0.2.0                                      │
│   Your data stays private — stored locally in your browser  │
└─────────────────────────────────────────────────────────────┘
```

## Section Details

### 1. Hero Section

**Remove:**
- "Internal Beta" badge

**Keep:**
- "TableCraft" logo
- "Event Seating Made Simple" tagline (works across markets)

**Update:**
- Description: "Design floor plans, manage guest lists, and let smart optimization handle the tricky seating decisions."
- CTA button: "Launch App" → "Start Planning Free"

### 2. Feature Cards

Replace technical "What to Test" cards with benefit-driven cards:

| Card | Icon | Heading | Description |
|------|------|---------|-------------|
| 1 | Relationship/heart | **Smart Seating** | Keep partners together, separate people who shouldn't sit near each other. The optimizer handles the relationship math. |
| 2 | Layout/grid | **Visual Floor Plans** | Drag-and-drop tables in any shape. Add venue elements like stages, bars, and dance floors. |
| 3 | Device/cloud | **Works Everywhere** | Phone, tablet, or desktop. Your data stays in your browser — private and always available. |

### 3. Use Case Row

Simple text row showing market breadth:

```
Perfect for: Weddings · Corporate Dinners · Galas · Team Offsites · Private Parties
```

Light styling, serves as both social proof of versatility and SEO keyword placement.

### 4. Animated Demo

**Keep as-is.** The current demo effectively shows drag-and-drop guest assignment.

### 5. Coming Soon Section

Two cards highlighting planned features:

| Card | Heading | Description |
|------|---------|-------------|
| 1 | **AI-Powered Seating** | Advanced algorithms that learn guest relationships and preferences to suggest optimal arrangements |
| 2 | **Guest Import & RSVP** | Upload your guest list from a spreadsheet and track responses as they come in |

Styling: Slightly muted compared to main features (subtle border, "Coming Soon" label)

### 6. Email Capture

**Heading:** "Stay in the loop"

**Form:**
- Email input field
- Subscribe button
- Submits to Google Form (external link or embedded)

**Implementation:** For MVP, link to a Google Form. Can upgrade to Buttondown/ConvertKit later.

### 7. Footer

**Keep:**
- "What's New" button (UpdatesPopup)

**Update:**
- Remove "beta" from version display: "v{version} beta" → "v{version}"

**Add:**
- Trust line: "Your data stays private — stored locally in your browser, not our servers."

## Meta Tags (index.html)

```html
<title>TableCraft - Free Event Seating Chart Planner</title>
<meta name="description" content="Drag-and-drop seating charts for weddings, corporate events, and private parties. Smart optimization keeps the right people together. Free to use.">

<!-- Open Graph for social sharing -->
<meta property="og:title" content="TableCraft - Free Event Seating Chart Planner">
<meta property="og:description" content="Drag-and-drop seating charts for weddings, corporate events, and private parties. Smart optimization keeps the right people together.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://tablecraft.app/">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="TableCraft - Free Event Seating Chart Planner">
<meta name="twitter:description" content="Drag-and-drop seating charts for weddings, corporate events, and private parties. Smart optimization keeps the right people together.">
```

Note: og:image and twitter:image should be added when a preview image is created.

## CSS Changes

New styles needed for:
- `.use-cases` — Use case row styling
- `.coming-soon-section` — Section container
- `.coming-soon-card` — Card styling (muted variant)
- `.coming-soon-badge` — "Coming Soon" label
- `.email-capture` — Form container
- `.email-input` — Input field styling
- `.subscribe-button` — Button styling
- `.trust-line` — Footer trust message

## Implementation Checklist

- [ ] Update `index.html` with meta tags
- [ ] Rewrite `LandingPage.tsx`:
  - [ ] Remove beta badge
  - [ ] Update hero description and CTA
  - [ ] Replace feature cards content
  - [ ] Add use case row
  - [ ] Add coming soon section
  - [ ] Add email capture form
  - [ ] Update footer (remove beta, add trust line)
- [ ] Update `LandingPage.css`:
  - [ ] Add new section styles
  - [ ] Rename `.testing-*` classes to `.feature-*`
  - [ ] Style coming soon cards
  - [ ] Style email capture form
- [ ] Create Google Form for email capture
- [ ] Test responsive behavior on mobile

## Email Capture: Google Forms Integration

1. Create Google Form with single email field
2. Get the form's action URL and email field name
3. Option A: Link "Subscribe" button to open form in new tab
4. Option B: Submit directly via form action (requires CORS handling)

For simplicity, Option A (link to form) is recommended for MVP.
