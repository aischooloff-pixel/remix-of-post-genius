import { Lock, MessageCircle } from "lucide-react";
import { ADMIN_CONTACT } from "@/hooks/useAccessControl";
import { useTelegram } from "@/hooks/useTelegram";

interface PaywallMessageProps {
  className?: string;
}

export function PaywallMessage({ className }: PaywallMessageProps) {
  const { openTelegramLink } = useTelegram();

  const handleContactAdmin = () => {
    openTelegramLink(`https://t.me/${ADMIN_CONTACT.replace("@", "")}`);
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 bg-secondary/30 rounded-xl border border-border/50">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Доступ ограничен</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Для использования AI-функций необходимо оформить доступ
          </p>
        </div>
        <button
          onClick={handleContactAdmin}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Написать {ADMIN_CONTACT}
        </button>
      </div>
    </div>
  );
}
