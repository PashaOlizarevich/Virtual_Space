"use client";

import { Boxes, ClipboardList, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

type AdminSection = "dashboard" | "products" | "orders" | "settings";

export function AdminShell({ active, children }: { active: AdminSection; children: ReactNode }) {
  const links = [
    { href: "/admin", label: "Обзор", icon: LayoutDashboard, id: "dashboard" as const },
    { href: "/admin/products", label: "Товары", icon: Boxes, id: "products" as const },
    { href: "/admin/orders", label: "Заказы", icon: ClipboardList, id: "orders" as const },
    { href: "/admin/settings", label: "Настройки", icon: Settings, id: "settings" as const },
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
          </ul>
        </nav>
        <Button
          className="admin-sidebar__logout"
          variant="ghost"
          onClick={() => void signOut({ callbackUrl: "/admin" })}
        >
          <LogOut data-icon="inline-start" aria-hidden="true" />
          Выйти
        </Button>
      </aside>
      {children}
    </div>
  );
}
