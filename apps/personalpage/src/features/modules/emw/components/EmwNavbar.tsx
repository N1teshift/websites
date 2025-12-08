import React from "react";
import Link from "next/link";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

const EmwNavbar: React.FC = () => {
  const { t } = useFallbackTranslation();

  const navLinks = [
    { href: "/projects/emw/home", key: "nav_home" },
    { href: "/projects/emw/voting-precincts", key: "nav_voting_precincts" },
    { href: "/projects/emw/counting-precincts", key: "nav_counting_precincts" },
    { href: "/projects/emw/counties", key: "nav_counties" },
    { href: "/projects/emw/myTasks", key: "nav_my_tasks" },
  ];

  return (
    <nav className="w-full bg-surface-card border-b-2 border-border-default text-text-primary p-4 mb-5 flex justify-start items-center shadow-sm">
      <div className="flex items-center space-x-4">
        {navLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="hover:text-brand-primary transition-colors font-medium"
          >
            {t(link.key)}
          </Link>
        ))}
      </div>
      {/* Placeholder for potential future elements like user info */}
    </nav>
  );
};

export default EmwNavbar;
