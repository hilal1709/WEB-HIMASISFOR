"use client";
import Image from "next/image";
import Link from "next/link";
import { LordIcon } from "@/components/media/lord-icon";
import { PMB_URL } from "@/lib/home-content";

const LEFT = [
  { label: "Beranda", href: "/", icon: "home", current: true },
  { label: "Profil", href: "/profile", icon: "account" },
];
const RIGHT = [
  { label: "Akademik", href: "/curiculum", icon: "book" },
  { label: "Layanan", href: "/layanan-akademik", icon: "category" },
  { label: "PMB", href: PMB_URL, icon: "plus-circle" },
];

function Item({ item, i }) {
  const cls = `bnav__item bnav__item--${i}`;
  return (
    <li>
      <Link href={item.href} className={cls} aria-current={item.current ? "page" : undefined}>
        <LordIcon
          name={item.icon}
          size={30}
          trigger="hover"
          target={`.bnav__item--${i}`}
          colors={item.current ? "primary:#a80a0b,secondary:#a80a0b" : "primary:#0b1b45,secondary:#0b1b45"}
          stroke="bold"
        />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

/** Navigasi pil di bawah layar dengan lencana Elvo di tengah (pola RAJA Brawijaya). */
export function BottomNav() {
  return (
    <nav aria-label="Navigasi utama" className="r-nav bnav">
      <ul className="bnav__list">
        {LEFT.map((it, i) => (
          <Item key={it.label} item={it} i={i} />
        ))}
        <li className="bnav__badge-slot" aria-hidden="true" />
        {RIGHT.map((it, i) => (
          <Item key={it.label} item={it} i={i + 2} />
        ))}
      </ul>
      <Link href="/" className="bnav__badge" aria-label="Elvo, kembali ke awal">
        <Image src="/plates/nav-elvo.png" alt="" fill sizes="132px" className="object-contain" />
      </Link>
    </nav>
  );
}
