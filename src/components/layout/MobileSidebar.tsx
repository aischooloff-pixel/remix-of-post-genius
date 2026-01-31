import { Link, useLocation } from "react-router-dom";
import {
  PenSquare,
  History,
  Bot,
  Sparkles,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const mainNav: NavItem[] = [
  { icon: PenSquare, label: "Создать пост", href: "/" },
  { icon: History, label: "Посты", href: "/history" },
];

const toolsNav: NavItem[] = [
  { icon: Bot, label: "Настройки", href: "/settings" },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        to={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
          "hover:bg-secondary group relative",
          isActive && "bg-primary/10 text-primary"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 shrink-0",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        <span className={cn(
          "text-base font-medium",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {item.label}
        </span>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle asChild>
            <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold gradient-text">TelePost</span>
                <span className="text-xs text-muted-foreground">AI Автоматизация</span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 p-4 space-y-6">
          <div className="space-y-1">
            <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Посты
            </span>
            <div className="space-y-1 mt-2">
              {mainNav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Инструменты
            </span>
            <div className="space-y-1 mt-2">
              {toolsNav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
