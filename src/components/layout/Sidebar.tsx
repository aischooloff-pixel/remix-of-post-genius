import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PenSquare,
  History,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: PenSquare, label: "Создать пост", href: "/" },
  { icon: History, label: "История постов", href: "/history" },
];

const toolsNav: NavItem[] = [
  { icon: Bot, label: "Настройки", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    const linkContent = (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "hover:bg-secondary group relative",
          isActive && "bg-primary/10 text-primary"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 shrink-0",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        {!collapsed && (
          <>
            <span className={cn(
              "text-sm font-medium",
              isActive ? "text-primary" : "text-foreground"
            )}>
              {item.label}
            </span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "h-screen border-r border-border bg-sidebar flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center glow-effect">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold gradient-text">TelePost</span>
              <span className="text-xs text-muted-foreground">AI Автоматизация</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {!collapsed && (
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Посты
            </span>
          )}
          <div className="space-y-1 mt-2">
            {mainNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Инструменты
            </span>
          )}
          <div className="space-y-1 mt-2">
            {toolsNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Collapse */}
      <div className="p-3 border-t border-border space-y-2">
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Свернуть</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}