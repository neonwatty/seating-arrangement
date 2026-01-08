import { UseCaseLandingPage } from '../UseCaseLandingPage';
import type { UseCaseConfig } from '../UseCaseLandingPage';

const corporateConfig: UseCaseConfig = {
  slug: 'corporate-events',
  title: 'Corporate Event Seating Planner',
  metaDescription: 'Free corporate event seating chart software. Plan seating for conferences, company dinners, and business events. Balance departments, manage VIPs, and export professional layouts.',

  tagline: 'Corporate Event Seating Planner',
  description: 'Plan professional seating arrangements for company dinners, conferences, and business events. Balance departments across tables, prioritize VIP placement, and create networking opportunities.',
  ctaText: 'Plan Your Corporate Event',

  specificBenefits: [
    'Balance team members and departments across tables',
    'Prioritize VIP and executive seating',
    'Encourage cross-team networking',
    'Professional PDF exports for event staff',
    'Works with conference, banquet, or custom layouts',
    'Last-minute changes sync instantly',
  ],

  features: [
    {
      icon: 'users',
      title: 'Department Balancing',
      description: 'Automatically distribute team members across tables to encourage cross-department networking. No more tables of all engineers or all sales.',
    },
    {
      icon: 'calendar',
      title: 'VIP & Executive Management',
      description: 'Prioritize placement for executives, clients, and special guests. Ensure key stakeholders are seated appropriately with the right tablemates.',
    },
    {
      icon: 'grid',
      title: 'Flexible Venue Layouts',
      description: 'Design any venue setup — conference style, banquet rounds, theater seating, or custom arrangements. Add podiums, screens, and refreshment stations.',
    },
    {
      icon: 'export',
      title: 'Professional Exports',
      description: 'Generate clean PDF seating charts and place cards for your event coordinator. Share digital versions via QR codes for easy day-of reference.',
    },
  ],

  faqItems: [
    {
      question: 'How do I ensure different departments mix at tables?',
      answer: 'Tag guests by department or team, then use the optimizer to automatically balance groups across tables. You can also manually drag specific people to encourage key networking connections.',
    },
    {
      question: 'Can I accommodate dietary restrictions?',
      answer: 'Yes! Add dietary notes to each guest profile. Export includes dietary information so catering staff can identify special meals at each seat.',
    },
    {
      question: 'How do I handle last-minute RSVPs or cancellations?',
      answer: 'Simply add or remove guests and the layout updates instantly. If you\'ve shared via QR code, updates sync automatically — no need to reprint.',
    },
    {
      question: 'Can multiple people edit the seating chart?',
      answer: 'Currently, charts are stored locally in one browser. For team collaboration, export and share the PDF, or use the shareable link feature for read-only viewing.',
    },
  ],
};

export function CorporateEventsPage() {
  return <UseCaseLandingPage config={corporateConfig} />;
}
