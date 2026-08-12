import React from "react";

export const PaymentSuccessIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="130" height="110" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="35" y="38" width="60" height="62" rx="14" fill="#00D2B4" />
    <path d="M42 38L55 20H75L88 38H42Z" fill="#00BCA2" />
    <rect x="44" y="48" width="42" height="26" rx="6" fill="#00A38C" />
    <circle cx="65" cy="61" r="7" fill="#FFFFFF" />
    <path d="M62 61L64 63L68 59" stroke="#00D2B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <g transform="rotate(-22 40 32)">
      <rect x="12" y="24" width="48" height="30" rx="6" fill="#00E6C8" stroke="#FFFFFF" strokeWidth="2" />
      <rect x="18" y="30" width="10" height="8" rx="2" fill="#FFC72C" />
      <circle cx="48" cy="44" r="4" fill="#FFFFFF" opacity="0.6" />
    </g>
    <path d="M57 20V8H73V20L70 17L67 20L64 17L61 20L57 17Z" fill="#FFFFFF" stroke="#00BCA2" strokeWidth="1.5" />
    <line x1="60" y1="12" x2="70" y2="12" stroke="#00A38C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PaymentCancelledIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="130" height="110" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="42" y="12" width="46" height="84" rx="14" fill="#FF3B6B" />
    <rect x="46" y="18" width="38" height="72" rx="9" fill="#FF527C" />
    <circle cx="65" cy="46" r="13" fill="#FFFFFF" />
    <path d="M59 40L71 52M71 40L59 52" stroke="#FF3B6B" strokeWidth="2.5" strokeLinecap="round" />
    <g transform="rotate(-15 32 55)">
      <rect x="14" y="52" width="44" height="28" rx="5" fill="#FFFFFF" stroke="#FF3B6B" strokeWidth="1.5" />
      <rect x="18" y="57" width="8" height="6" rx="1" fill="#FFC72C" />
      <line x1="18" y1="70" x2="38" y2="70" stroke="#FFD4DF" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const PaymentUnsuccessfulIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="130" height="110" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="40" y="42" width="55" height="58" rx="12" fill="#5F5B7D" />
    <path d="M46 42L55 24H80L89 42H46Z" fill="#4C4866" />
    <rect x="47" y="50" width="41" height="24" rx="5" fill="#78739B" />
    <circle cx="66" cy="20" r="14" fill="#FFFFFF" stroke="#5F5B7D" strokeWidth="2" />
    <circle cx="60" cy="17" r="1.5" fill="#5F5B7D" />
    <circle cx="72" cy="17" r="1.5" fill="#5F5B7D" />
    <path d="M60 25C63 22 69 22 72 25" stroke="#5F5B7D" strokeWidth="2" strokeLinecap="round" />
    <g transform="rotate(-10 45 70)">
      <rect x="30" y="65" width="46" height="28" rx="5" fill="#FFE55B" stroke="#5F5B7D" strokeWidth="1.5" />
      <circle cx="62" cy="79" r="6" fill="#FF3B6B" />
      <path d="M59 76L65 82M65 76L59 82" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

export const PartyPopperIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M54 14L60 20M60 14L54 20" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" />
    <circle cx="34" cy="18" r="3.5" fill="#3B82F6" />
    <circle cx="68" cy="30" r="4" fill="#8B5CF6" />
    <rect x="44" y="24" width="7" height="7" rx="2" fill="#10B981" transform="rotate(25 44 24)" />
    <path d="M24 30C24 30 29 25 34 29" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    <path d="M62 14C62 14 67 19 70 14" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
    <path d="M28 66L48 46L56 54L36 74C33.2 76.8 28.8 76.8 26 74C23.2 71.2 23.2 66.8 26 64L28 66Z" fill="#FF7A59" />
    <path d="M48 46L28 66L21 59C18.2 56.2 18.2 51.8 21 49L41 29L48 46Z" fill="#FFC107" />
    <path d="M48 46L56 54L66 36L48 46Z" fill="#38BDF8" />
    <path d="M48 46L66 36L41 29L48 46Z" fill="#A855F7" />
  </svg>
);

export const ToastSuccessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5" {...props}>
    <circle cx="10" cy="10" r="10" fill="#1E7F4C" />
    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ToastErrorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5" {...props}>
    <circle cx="10" cy="10" r="10" fill="#B3261E" />
    <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ToastInfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5" {...props}>
    <circle cx="10" cy="10" r="10" fill="#0284C7" />
    <path d="M10 6V10M10 14H10.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ErrorCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" fill="#B3261E" />
    <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
