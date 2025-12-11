export interface OnboardingStep {
  id: string;
  target: string | null;        // CSS selector for element to highlight (null for centered modal)
  targetFallback?: string;      // Fallback selector if primary not found
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiredView?: 'dashboard' | 'canvas' | 'guests';
  highlightPadding?: number;    // Extra padding around highlighted element
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to TableCraft!',
    description: "Let's take a quick tour of the key features. This will only take about a minute.",
    placement: 'center',
  },
  {
    id: 'canvas-overview',
    target: '.canvas-container',
    targetFallback: '.canvas',
    title: 'The Canvas',
    description: 'This is your floor plan. Drag tables to arrange them, zoom with scroll, and pan by holding Shift while dragging.',
    placement: 'center',
    requiredView: 'canvas',
    highlightPadding: 0,
  },
  {
    id: 'add-table',
    target: '.add-dropdown',
    targetFallback: '.main-toolbar',
    title: 'Add Tables',
    description: 'Click here to add tables to your floor plan. Choose from round, rectangle, square, and other shapes.',
    placement: 'bottom',
    requiredView: 'canvas',
    highlightPadding: 8,
  },
  {
    id: 'sidebar',
    target: '.sidebar',
    targetFallback: '.sidebar-toggle',
    title: 'Guest Sidebar',
    description: 'Your guest list appears here. Drag guests from this panel onto tables to assign their seats.',
    placement: 'right',
    requiredView: 'canvas',
    highlightPadding: 0,
  },
  {
    id: 'view-toggle',
    target: '.view-toggle',
    targetFallback: '.view-toggle-container',
    title: 'Switch Views',
    description: 'Toggle between Canvas view for visual arrangement and Guest List view for detailed management.',
    placement: 'bottom',
    requiredView: 'canvas',
    highlightPadding: 8,
  },
  {
    id: 'optimize',
    target: '.toolbar-btn.primary',
    targetFallback: '.main-toolbar',
    title: 'Smart Optimization',
    description: 'Once you set up guest relationships, click Optimize to automatically arrange seating. Partners stay together, conflicts are separated.',
    placement: 'bottom',
    requiredView: 'canvas',
    highlightPadding: 8,
  },
  {
    id: 'help',
    target: '.help-btn',
    title: 'Need Help?',
    description: "Press ? anytime to see keyboard shortcuts. You can restart this tour from the header.",
    placement: 'bottom',
    highlightPadding: 12,
  },
];
