"use client";

import { Boxes, ClipboardList, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAdminPreviewSession } from "@/modules/admin/session-provider";
import { cn } from "@/shared/utils";

type AdminSection = "dashboard" | "products";

export function AdminShell({ active, children }: { active: AdminSection; children: ReactNode }) {
  const session = useAdminPreviewSession();
  const links = [
    { href: "/admin", label: "Обзор", icon: LayoutDashboard, id: "dashboard" as const },
    { href: "/admin/products", label: "Товары", icon: Boxes, id: "products" as const },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Навигация администратора">
        <Link className="admin-sidebar__brand" href="/" aria-label="Virtual Space — на главную">
          Virtual Space
        </Link>
        <nav>
          <ul className="admin-sidebar__navigation">
            {links.map(({ href, label, icon: Icon, id }) => (
              <li key={id}>
                <Link
                  className={cn(
                    "admin-sidebar__link",
                    active === id && "admin-sidebar__link--active",
                  )}
                  href={href}
                  aria-current={active === id ? "page" : undefined}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
            {[
              { label: "Заказы", icon: ClipboardList },
              { label: "Настройки", icon: Settings },
            ].map(({ label, icon: Icon }) => (
              <li key={label}>
                <span
                  className="admin-sidebar__link admin-sidebar__link--disabled"
                  aria-disabled="true"
                >
                  <Icon aria-hidden="true" />
                  {label}
                  <span className="admin-sidebar__soon">Скоро</span>
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <Button className="admin-sidebar__logout" variant="ghost" onClick={session.signOut}>
          <LogOut data-icon="inline-start" aria-hidden="true" />
          Выйти
        </Button>
      </aside>
      {children}
    </div>
  );
}
