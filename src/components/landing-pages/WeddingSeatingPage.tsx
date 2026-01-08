import { UseCaseLandingPage } from '../UseCaseLandingPage';
import type { UseCaseConfig } from '../UseCaseLandingPage';

const weddingConfig: UseCaseConfig = {
  slug: 'wedding-seating',
  title: 'Wedding Seating Chart Maker',
  metaDescription: 'Free wedding seating chart maker. Create beautiful seating arrangements for your reception. Keep couples together, manage family dynamics, and export to PDF. No signup required.',

  tagline: 'Free Wedding Seating Chart Maker',
  description: 'Plan your perfect reception seating in minutes. Our smart optimizer keeps couples together, manages family dynamics, and creates harmonious table arrangements — all with simple drag-and-drop.',
  ctaText: 'Start Planning Your Wedding Seating',

  specificBenefits: [
    'Keep couples and partners seated together automatically',
    'Separate guests who shouldn\'t sit near each other',
    'Balance tables by guest count and relationships',
    'Export beautiful seating charts to PDF',
    'Share via QR code for day-of coordination',
    'Works with any venue layout or table shape',
  ],

  features: [
    {
      icon: 'heart',
      title: 'Couple & Partner Seating',
      description: 'Mark guest relationships and our optimizer automatically keeps partners together at the same table. Perfect for ensuring couples, engaged pairs, and close family sit together.',
    },
    {
      icon: 'users',
      title: 'Family Dynamics Management',
      description: 'Easily manage complex family situations. Keep certain relatives apart while ensuring others sit together. The algorithm handles the tricky seating math.',
    },
    {
      icon: 'grid',
      title: 'Reception Floor Plan',
      description: 'Design your reception layout with round, rectangular, or custom table shapes. Add the head table, sweetheart table, cake table, and dance floor.',
    },
    {
      icon: 'export',
      title: 'Beautiful PDF Export',
      description: 'Export your seating chart, place cards, and table cards as PDFs ready for printing. Perfect for your venue coordinator and day-of setup.',
    },
  ],

  faqItems: [
    {
      question: 'How do I handle divorced parents at a wedding?',
      answer: 'Use the "keep apart" relationship to ensure they\'re seated at different tables. You can also manually assign specific seats to control exact placement. Many couples seat divorced parents at separate family tables.',
    },
    {
      question: 'Can I create a sweetheart table or head table?',
      answer: 'Yes! Add any table shape you need. Create a rectangular head table for the wedding party, a sweetheart table for just the couple, or traditional round tables for guests.',
    },
    {
      question: 'How do I share the seating chart with my venue?',
      answer: 'Export to PDF for a printable version, or share a live QR code that your coordinator can scan on the wedding day. Changes sync automatically if you make last-minute updates.',
    },
    {
      question: 'Can I import my guest list from The Knot or Zola?',
      answer: 'You can import any guest list via CSV/Excel export from your planning tool. Copy-paste from a spreadsheet works too. We\'re adding direct integrations with The Knot, Zola, and other platforms soon.',
    },
    {
      question: 'Is my guest list data private?',
      answer: 'Completely! All data stays in your browser — we don\'t have servers that store your information. Your guest names, relationships, and seating never leave your device.',
    },
  ],
};

export function WeddingSeatingPage() {
  return <UseCaseLandingPage config={weddingConfig} />;
}
