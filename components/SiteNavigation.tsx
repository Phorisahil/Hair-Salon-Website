"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/booking", label: "Booking" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav id="main-navigation" className="main-nav" data-open={open} aria-label="Main navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
      </nav>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Close menu" : "Menu"}
      </button>
    </>
  );
}
