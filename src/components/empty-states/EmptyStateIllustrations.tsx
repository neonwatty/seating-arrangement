// SVG Illustrations for Empty States
// Design: Line-art style, 2px stroke, using CSS variables for colors

export function EmptyCanvasIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="empty-illustration">
      {/* Floor plan outline */}
      <rect
        x="20"
        y="20"
        width="160"
        height="110"
        rx="8"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeDasharray="8 4"
      />

      {/* Dashed table shapes suggesting placement */}
      <circle
        cx="60"
        cy="70"
        r="25"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <rect
        x="110"
        y="50"
        width="50"
        height="30"
        rx="4"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.5"
      />

      {/* Plus icon */}
      <g className="pulse-icon">
        <circle cx="100" cy="100" r="15" fill="var(--color-primary)" opacity="0.2" />
        <path
          d="M100 92 v16 M92 100 h16"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function EmptyGuestsIllustration() {
  return (
    <svg viewBox="0 0 180 120" className="empty-illustration">
      {/* Three faded guest bubbles */}
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        fontSize="14"
        fontFamily="inherit"
      >
        ?
      </text>

      <circle
        cx="90"
        cy="60"
        r="20"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <text
        x="90"
        y="65"
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        fontSize="14"
        fontFamily="inherit"
      >
        ?
      </text>

      <circle
        cx="130"
        cy="50"
        r="20"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <text
        x="130"
        y="55"
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        fontSize="14"
        fontFamily="inherit"
      >
        ?
      </text>

      {/* Add guest prompt */}
      <g className="pulse-icon">
        <circle cx="90" cy="95" r="12" fill="var(--color-primary)" opacity="0.2" />
        <path
          d="M90 89 v12 M84 95 h12"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function AllAssignedIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="empty-illustration">
      {/* Checkmark circle */}
      <circle cx="60" cy="60" r="45" fill="var(--color-success)" opacity="0.1" />
      <circle
        cx="60"
        cy="60"
        r="35"
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="3"
      />
      <path
        d="M42 60 l12 12 l24 -24"
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Confetti dots */}
      <circle cx="25" cy="30" r="4" fill="var(--color-primary)" />
      <circle cx="95" cy="25" r="3" fill="var(--color-secondary)" />
      <circle cx="100" cy="90" r="4" fill="var(--color-primary)" />
      <circle cx="20" cy="85" r="3" fill="var(--color-secondary)" />
    </svg>
  );
}

export function NoTablesIllustration() {
  return (
    <svg viewBox="0 0 180 120" className="empty-illustration">
      {/* Empty floor outline */}
      <rect
        x="30"
        y="20"
        width="120"
        height="80"
        rx="6"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeDasharray="6 3"
      />

      {/* Ghost table */}
      <circle
        cx="90"
        cy="60"
        r="22"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeDasharray="4 2"
        opacity="0.5"
      />

      {/* Table label */}
      <text
        x="90"
        y="65"
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize="10"
        fontFamily="inherit"
      >
        Table?
      </text>

      {/* Add button hint */}
      <g className="pulse-icon">
        <circle cx="90" cy="105" r="10" fill="var(--color-primary)" opacity="0.2" />
        <path
          d="M90 100 v10 M85 105 h10"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function NoRelationshipsIllustration() {
  return (
    <svg viewBox="0 0 180 120" className="empty-illustration">
      {/* Two guest circles */}
      <circle
        cx="50"
        cy="60"
        r="25"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <circle
        cx="130"
        cy="60"
        r="25"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />

      {/* Guest icons */}
      <path
        d="M50 52 a5 5 0 1 0 0 -1 M42 70 a16 10 0 0 1 16 0"
        fill="none"
        stroke="var(--color-text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M130 52 a5 5 0 1 0 0 -1 M122 70 a16 10 0 0 1 16 0"
        fill="none"
        stroke="var(--color-text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Dotted connection line with question */}
      <line
        x1="75"
        y1="60"
        x2="105"
        y2="60"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle cx="90" cy="60" r="10" fill="var(--color-bg)" stroke="var(--color-border)" strokeWidth="2" />
      <text
        x="90"
        y="64"
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        fontSize="12"
        fontFamily="inherit"
      >
        ?
      </text>
    </svg>
  );
}

export function SearchNoResultsIllustration() {
  return (
    <svg viewBox="0 0 180 120" className="empty-illustration">
      {/* Magnifying glass */}
      <circle
        cx="75"
        cy="55"
        r="30"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="3"
      />
      <line
        x1="97"
        y1="77"
        x2="120"
        y2="100"
        stroke="var(--color-border)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* X inside magnifying glass */}
      <path
        d="M65 45 l20 20 M85 45 l-20 20"
        stroke="var(--color-text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="empty-illustration">
      {/* Venue outline */}
      <rect
        x="20"
        y="30"
        width="160"
        height="100"
        rx="10"
        fill="var(--color-bg-secondary)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />

      {/* Round table */}
      <circle
        cx="60"
        cy="75"
        r="22"
        fill="var(--color-bg)"
        stroke="var(--color-primary)"
        strokeWidth="2"
      />

      {/* Rectangle table */}
      <rect
        x="100"
        y="55"
        width="55"
        height="35"
        rx="6"
        fill="var(--color-bg)"
        stroke="var(--color-primary)"
        strokeWidth="2"
      />

      {/* Guest dots on round table */}
      <circle cx="45" cy="65" r="6" fill="var(--color-secondary)" />
      <circle cx="75" cy="65" r="6" fill="var(--color-secondary)" />
      <circle cx="55" cy="90" r="6" fill="var(--color-secondary)" />
      <circle cx="65" cy="58" r="6" fill="var(--color-secondary)" />

      {/* Guest dots on rectangle table */}
      <circle cx="110" cy="65" r="6" fill="var(--color-secondary)" />
      <circle cx="127" cy="65" r="6" fill="var(--color-secondary)" />
      <circle cx="144" cy="65" r="6" fill="var(--color-secondary)" />
      <circle cx="110" cy="80" r="6" fill="var(--color-secondary)" />
      <circle cx="127" cy="80" r="6" fill="var(--color-secondary)" />
      <circle cx="144" cy="80" r="6" fill="var(--color-secondary)" />

      {/* Sparkles */}
      <path
        d="M45 35 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z"
        fill="var(--color-primary)"
      />
      <path
        d="M170 45 l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5 z"
        fill="var(--color-secondary)"
      />
    </svg>
  );
}
