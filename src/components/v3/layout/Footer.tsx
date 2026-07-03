import Image from "next/image";
import { footerFallback, type MenuItem } from "@/lib/menu";

const joinLinks = [
  { label: "Organisations partenaires", href: "https://itpcmena.org/" },
  { label: "S'impliquer", href: "https://itpcmena.org/" },
  { label: "Appels d'offres", href: "https://itpcmena.org/" },
];

export function FooterV3({ menu = footerFallback }: { menu?: MenuItem[] }) {
  return (
    <footer id="contact" className="bg-ink px-6 pb-10 pt-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 pb-12 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
        {/* Brand */}
        <div>
          <Image
            src="https://itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
            alt="ITPC-MENA"
            width={140}
            height={40}
            className="h-10 w-auto brightness-0 invert"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            International Treatment Preparedness Coalition — Région Moyen-Orient
            et Afrique du Nord. Pour un accès équitable à la santé.
          </p>
          <div className="mt-5 flex gap-2.5">
            {["f", "in", "𝕏"].map((s) => (
              <a
                key={s}
                href="https://itpcmena.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm text-white/55 transition hover:bg-red hover:text-white"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            Navigation
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {menu.map((l) => (
              <li key={l.label}>
                <a
                  href={l.url}
                  target={l.target}
                  rel={l.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="transition hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Join */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            Nous rejoindre
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {joinLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            Contact
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            Une question, un partenariat, une demande média ?
          </p>
          <p className="mt-2 text-sm">
            <a
              href="mailto:contact@itpcmena.org"
              className="font-semibold text-white transition hover:text-teal"
            >
              contact@itpcmena.org
            </a>
          </p>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-white/30">
        <p>© {new Date().getFullYear()} ITPC-MENA. Tous droits réservés.</p>
        <p>Région MENA · 14 pays</p>
      </div>
    </footer>
  );
}
