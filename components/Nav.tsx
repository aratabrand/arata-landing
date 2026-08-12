"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import WhatsAppCTA from "./WhatsAppCTA";

const links = [
  { id: "solucion", href: "#solucion", label: "Qué hacemos" },
  { id: "como", href: "#como", label: "Cómo funciona" },
  { id: "dudas", href: "#dudas", label: "Dudas" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Scrollspy: activa la sección cuyo inicio ya pasó la línea del navbar.
      const line = 120;
      let current: string | null = null;
      for (const { id } of links) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <nav
        className={`pointer-events-auto flex h-14 w-full max-w-content items-center justify-between rounded-full px-4 transition-all duration-500 sm:px-6 ${
          scrolled
            ? "border border-white/10 bg-ink/70 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150"
            : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="shrink-0" aria-label="Arata San, inicio">
          <Logo surface="dark" className="h-6 w-auto sm:h-7" />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = activeId === link.id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active ? "true" : undefined}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    active ? "text-lime" : "text-white/85 hover:text-lime"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <WhatsAppCTA variant="lime" label="Agendar" className="!px-5 !py-2.5 !text-sm" />
      </nav>
    </header>
  );
}
