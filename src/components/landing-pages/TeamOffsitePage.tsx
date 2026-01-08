import { UseCaseLandingPage } from '../UseCaseLandingPage';
import type { UseCaseConfig } from '../UseCaseLandingPage';

const teamOffsiteConfig: UseCaseConfig = {
  slug: 'team-offsite',
  title: 'Team Offsite Seating Planner',
  metaDescription: 'Free team offsite seating chart tool. Plan seating for company retreats, team building events, and workshops. Mix teams, encourage networking, and facilitate collaboration.',

  tagline: 'Team Offsite & Retreat Seating',
  description: 'Maximize your team offsite with strategic seating. Mix departments, encourage cross-team connections, and create the perfect environment for collaboration and team building.',
  ctaText: 'Plan Your Team Offsite',

  specificBenefits: [
    'Mix teams intentionally for networking',
    'Rotate seating across sessions',
    'Balance experience levels at tables',
    'Quick setup for workshops and breakouts',
    'Share assignments digitally — no printing',
    'Adapt seating as schedule changes',
  ],

  features: [
    {
      icon: 'users',
      title: 'Cross-Team Mixing',
      description: 'Automatically mix people from different teams, offices, or tenure levels. Break silos and encourage new working relationships.',
    },
    {
      icon: 'calendar',
      title: 'Session-Based Seating',
      description: 'Create different seating arrangements for each session — morning networking, afternoon workshops, dinner. Switch layouts with a click.',
    },
    {
      icon: 'grid',
      title: 'Workshop & Conference Layouts',
      description: 'Design classroom style, roundtable discussions, or theater seating. Add breakout rooms, presentation areas, and refreshment stations.',
    },
    {
      icon: 'mobile',
      title: 'Digital-First Sharing',
      description: 'Share seating via QR code or link — attendees check their phones instead of crowding around a poster. Updates sync in real-time.',
    },
  ],

  faqItems: [
    {
      question: 'How do I ensure no one sits with their usual team?',
      answer: 'Tag everyone by team, then use the optimizer with the "keep apart" setting for same-team members. This guarantees cross-team tables automatically.',
    },
    {
      question: 'Can I create multiple seating plans for different sessions?',
      answer: 'Create separate events for each session (Day 1 Lunch, Day 1 Workshop, Day 2 Dinner). You can copy guest lists between them and create fresh arrangements.',
    },
    {
      question: 'What if our headcount changes last minute?',
      answer: 'Add or remove attendees instantly. The optimizer can redistribute if needed, or you can manually adjust specific tables.',
    },
    {
      question: 'How do I balance senior and junior staff at tables?',
      answer: 'Tag guests by level (senior, mid, junior) and the optimizer will distribute them evenly. Great for mentorship-focused seating.',
    },
  ],
};

export function TeamOffsitePage() {
  return <UseCaseLandingPage config={teamOffsiteConfig} />;
}
