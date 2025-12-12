# Changelog

All notable changes to TableCraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-12-11

### Added
- Interactive onboarding wizard for first-time users with spotlight tooltips
- "Tour" button in header to restart the guided tour anytime
- Mobile-optimized grid controls menu accessible at 480px breakpoint
- Single-finger pan mode toggle for easier mobile navigation
- Long-press visual feedback during drag activation on touch devices
- Bottom sheet style context menu on mobile with larger touch targets
- Animated counters for dashboard statistics with smooth number transitions
- Illustrated empty states with custom SVG graphics for guests, tables, and search
- Clickable `?` help button in header to show keyboard shortcuts modal
- Keyboard shortcuts `0` or `c` to re-center the canvas view
- Custom favicon with table and seats design
- Mobile device configurations (Pixel 5, iPhone 12, iPad) for Playwright testing

### Changed
- Landing page redesigned for internal beta testers with testing guidance
- Touch targets increased from 36px to 44px for seated guest circles (Apple HIG)
- Updates popup simplified to organize by version only (removed dates)

### Fixed
- Dark mode support for venue elements using CSS variables
- Constraint badge text colors and button gradients for dark mode consistency
- Shortcut key styling to prevent text overflow on longer shortcuts
- Toast notifications positioned correctly above toolbar

## [0.2.0] - 2025-12-10

### Added
- Dark mode toggle - switch between light, dark, and system themes
- Theme preference persists across sessions via localStorage
- E2E tests for theme toggle functionality

### Fixed
- Toast notification text contrast now readable in both light and dark modes

## [0.1.0] - 2025-12-09

### Added
- Highlight animation for newly created tables with pulsing glow effect
- Highlight animation for newly created guests with visual feedback
- Auto-selection and canvas panning to newly added guests
- E2E tests for new table visibility animations
- E2E tests for new guest visibility animations

### Changed
- Add Table dropdown now opens to the right instead of left for better UX

### Fixed
- Improved canvas zoom default to better showcase tables
- Add Table dropdown now properly appears above canvas elements
