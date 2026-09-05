import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Labs', href: '#' },
  { label: 'Studio', href: '#' },
  { label: 'Openings', href: '#' },
  { label: 'Shop', href: '#' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((v) => !v);

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5"
        style={{ zIndex: 10 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black select-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop center nav */}
        <div className="hidden md:flex items-center gap-0 text-[23px] text-black">
          {NAV_LINKS.map((link, i) => (
            <span key={link.label}>
              <a
                href={link.href}
                className="hover:opacity-60 transition-opacity duration-200"
              >
                {link.label}
              </a>
              {i < NAV_LINKS.length - 1 && (
                <span className="text-black select-none">, </span>
              )}
            </span>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="mailto:hello@mainframe.co"
          className="hidden md:block text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200"
        >
          Get in touch
        </a>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden flex-col gap-[5px] p-1 cursor-pointer bg-transparent border-none"
          onClick={toggleMobile}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className="block w-6 bg-black transition-all duration-300"
            style={{
              height: '2px',
              transform: mobileOpen ? 'rotate(45deg) translate(0, 7px)' : 'none',
            }}
          />
          <span
            className="block w-6 bg-black transition-all duration-300"
            style={{
              height: '2px',
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 bg-black transition-all duration-300"
            style={{
              height: '2px',
              transform: mobileOpen ? 'rotate(-45deg) translate(0, -7px)' : 'none',
            }}
          />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className="fixed inset-0 md:hidden flex flex-col justify-center px-8 gap-8"
        style={{
          zIndex: 9,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="mailto:hello@mainframe.co"
          className="text-[32px] font-medium text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
