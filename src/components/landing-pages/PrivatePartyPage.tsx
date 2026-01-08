import { UseCaseLandingPage } from '../UseCaseLandingPage';
import type { UseCaseConfig } from '../UseCaseLandingPage';

const privatePartyConfig: UseCaseConfig = {
  slug: 'private-party',
  title: 'Party Seating Chart Maker',
  metaDescription: 'Free party seating chart maker for birthday parties, anniversaries, and family gatherings. Organize guests, manage relationships, and create the perfect seating arrangement.',

  tagline: 'Party & Family Event Seating',
  description: 'Plan seating for birthday parties, anniversaries, reunions, and holiday gatherings. Keep friend groups together, manage family dynamics, and make sure everyone has a great time.',
  ctaText: 'Plan Your Party Seating',

  specificBenefits: [
    'Keep friend groups seated together',
    'Manage family relationship dynamics',
    'Perfect for birthdays and anniversaries',
    'Easy setup for any venue or home',
    'Kid-friendly table assignments',
    'Share with co-hosts instantly',
  ],

  features: [
    {
      icon: 'heart',
      title: 'Friend Group Seating',
      description: 'Mark who knows who and the optimizer keeps friend groups at the same table. No one ends up at a table of strangers.',
    },
    {
      icon: 'users',
      title: 'Family Dynamics',
      description: 'Handle the tricky stuff — keep feuding relatives apart, seat kids with parents, and make sure grandparents are close to the action.',
    },
    {
      icon: 'grid',
      title: 'Any Venue Setup',
      description: 'Whether it\'s backyard picnic tables, a restaurant private room, or your living room — design any layout with drag-and-drop ease.',
    },
    {
      icon: 'export',
      title: 'Easy Sharing',
      description: 'Text a link to co-hosts so they can see the plan. Print place cards or display the chart on a tablet at the entrance.',
    },
  ],

  faqItems: [
    {
      question: 'How do I keep kids at separate tables from adults?',
      answer: 'Create a "Kids Table" and assign children there, or tag children as a group and use the optimizer to seat them together. You can also seat them with their parents — your choice!',
    },
    {
      question: 'Can I plan seating for a restaurant private dining room?',
      answer: 'Absolutely! Create tables that match the restaurant\'s layout. Many restaurants share their floor plan — just recreate it in Seatify.',
    },
    {
      question: 'What if I don\'t know all my guests\' relationships?',
      answer: 'No problem! Only mark the relationships you know about. The optimizer works with whatever information you provide, and you can always manually adjust.',
    },
    {
      question: 'Can I seat people together who haven\'t met but should?',
      answer: 'Yes! Use the "partner" relationship to ensure specific people end up at the same table — great for introducing friends who\'d get along.',
    },
  ],
};

export function PrivatePartyPage() {
  return <UseCaseLandingPage config={privatePartyConfig} />;
}
