import { UseCaseLandingPage } from '../UseCaseLandingPage';
import type { UseCaseConfig } from '../UseCaseLandingPage';

const galaConfig: UseCaseConfig = {
  slug: 'gala-seating',
  title: 'Gala & Fundraiser Seating Chart',
  metaDescription: 'Free gala seating chart maker for fundraisers and charity events. Manage sponsors, donors, and VIP tables. Create elegant seating arrangements with our drag-and-drop planner.',

  tagline: 'Gala & Fundraiser Seating Chart',
  description: 'Create elegant seating arrangements for your charity gala, fundraiser, or awards ceremony. Manage sponsor tables, honor major donors, and ensure VIPs are perfectly placed.',
  ctaText: 'Plan Your Gala Seating',

  specificBenefits: [
    'Designate sponsor and donor tables',
    'VIP and honoree priority seating',
    'Balance board members across tables',
    'Elegant PDF exports for printing',
    'Stage-front and auction paddle placement',
    'Quick updates for auction winners',
  ],

  features: [
    {
      icon: 'heart',
      title: 'Sponsor & Donor Recognition',
      description: 'Create dedicated sponsor tables and ensure major donors are seated prominently. Tag giving levels to prioritize placement based on contribution.',
    },
    {
      icon: 'users',
      title: 'VIP & Honoree Placement',
      description: 'Position award recipients, keynote speakers, and honorees at prime tables near the stage. Manage their guests and plus-ones with care.',
    },
    {
      icon: 'grid',
      title: 'Grand Ballroom Layouts',
      description: 'Design elegant gala floor plans with round tables, a head table for dignitaries, dance floor, stage, and auction display areas.',
    },
    {
      icon: 'export',
      title: 'Elegant Print Materials',
      description: 'Export beautiful seating charts and place cards that match the sophistication of your event. Perfect for display boards and guest packets.',
    },
  ],

  faqItems: [
    {
      question: 'How do I manage sponsor table assignments?',
      answer: 'Create tables named for each sponsor level (Gold Table, Platinum Table, etc.) and assign their guests directly. You can also tag guests by sponsor for easy filtering.',
    },
    {
      question: 'Can I seat auction winners at specific tables?',
      answer: 'Yes! During the event, quickly update seating by dragging winners to their purchased tables. Changes can be viewed instantly via the shareable QR code.',
    },
    {
      question: 'How do I ensure board members are distributed across tables?',
      answer: 'Tag board members as a group, then let the optimizer distribute them evenly. This ensures each table has organizational representation for networking.',
    },
    {
      question: 'Can guests see where they\'re seated before the event?',
      answer: 'Share a read-only link or QR code that guests can access to find their table assignment. Great for including in pre-event communications.',
    },
  ],
};

export function GalaSeatingPage() {
  return <UseCaseLandingPage config={galaConfig} />;
}
