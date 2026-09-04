import { Link, useLocation, Navigate } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardShellProps {
  navItems: NavItem[];
  children: React.ReactNode;
  title: string;
  role: string;
}

export function DashboardShell({ navItems, children, title, role }: DashboardShellProps) {
  const location = useLocation();

  return (
    <div className="container py-6">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <Card className="p-4 sticky top-20">
            <div className="mb-4 px-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{role}</p>
              <p className="font-display font-bold mt-0.5">{title}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to ||
                  (item.to !== navItems[0].to && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                        active ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const location = useLocation();
  // This is a placeholder - actual auth check is done in the dashboard page itself
  return <>{children}</>;
}
