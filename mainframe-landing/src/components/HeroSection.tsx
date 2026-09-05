import { useEffect, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

const PILL_BUTTONS = [
  'Pitch us an idea',
  'Come work here',
  'Send a brief hello',
  'See how we operate',
];

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Back rectangle */}
      <rect x="3" y="0" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      {/* Front rectangle */}
      <rect x="0" y="3" width="8" height="8" rx="1.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function HeroSection() {
  const { displayed, done } = useTypewriter({
    text: "Glad you stopped in. Good taste tends to find us. Now, what are we building?",
    speed: 38,
    startDelay: 600,
  });

  // Pill buttons fade in 400ms after mount, independent of typewriter
  const [pillsVisible, setPillsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = 'hello@mainframe.co';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  return (
    <section
      className="relative h-screen flex flex-col justify-end md:justify-center pb-12 md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-xl relative" style={{ zIndex: 10 }}>

        {/* 1. Blurred intro label */}
        <div
          className="mb-5 sm:mb-6"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <p
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#000',
              filter: 'blur(4px)',
              margin: 0,
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe's Adaptive Response Interface Agent
          </p>
        </div>

        {/* 2. Typewriter text */}
        <p
          className="mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            color: '#000',
            minHeight: '54px',
            margin: '0 0 1.25rem 0',
          }}
        >
          {displayed}
          {!done && <span className="cursor-blink" aria-hidden="true" />}
        </p>

        {/* 3. Action pill buttons */}
        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* White pill buttons */}
          {PILL_BUTTONS.map((label) => (
            <button
              key={label}
              className="
                inline-flex items-center justify-center
                bg-white text-black
                border border-black/10 rounded-full
                text-[13px] sm:text-[15px]
                px-4 sm:px-5 py-[0.3em]
                mx-[0.2em] mb-[0.4em]
                whitespace-nowrap
                hover:bg-black hover:text-white
                transition-colors duration-200
                cursor-pointer
              "
            >
              {label}
            </button>
          ))}

          {/* Outline email pill */}
          <button
            onClick={handleCopyEmail}
            className="
              inline-flex items-center justify-center
              bg-transparent text-white
              border border-white rounded-full
              text-[13px] sm:text-[15px]
              px-4 sm:px-5 py-[0.3em]
              mx-[0.2em] mb-[0.4em]
              whitespace-nowrap
              gap-2 sm:gap-3
              hover:bg-white hover:text-black
              transition-colors duration-200
              cursor-pointer
            "
            title="Click to copy email"
          >
            <span>
              Reach us:{' '}
              <span className="underline underline-offset-1">hello@mainframe.co</span>
            </span>
            <CopyIcon />
          </button>
        </div>

      </div>
    </section>
  );
}
