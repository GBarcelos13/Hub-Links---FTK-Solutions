import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 248 40"
      fill="none"
      className={cn('h-8 w-auto', className)}
      aria-label="HUB Links"
    >
      {/* Connection lines */}
      <line x1="20" y1="20" x2="8"  y2="9"  stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="20" y1="20" x2="32" y2="9"  stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="20" y1="20" x2="8"  y2="31" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="20" y1="20" x2="32" y2="31" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      {/* Nodes */}
      <circle cx="20" cy="20" r="5.5" fill="#F59E0B"/>
      <circle cx="8"  cy="9"  r="3.5" fill="#F59E0B" opacity="0.75"/>
      <circle cx="32" cy="9"  r="3.5" fill="#F59E0B" opacity="0.75"/>
      <circle cx="8"  cy="31" r="3.5" fill="#F59E0B" opacity="0.5"/>
      <circle cx="32" cy="31" r="3.5" fill="#F59E0B" opacity="0.5"/>
      {/* Wordmark — tspan posiciona "links" automaticamente após "hub" */}
      <text
        x="48" y="28"
        fontFamily="'Syne', 'DM Sans', system-ui, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="currentColor"
      >
        hub<tspan
          dx="6"
          fontWeight="400"
          fill="#F59E0B"
        >links</tspan>
      </text>
    </svg>
  );
}
