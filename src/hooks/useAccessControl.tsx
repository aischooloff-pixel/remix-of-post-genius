import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegram } from "./useTelegram";

// Admin contact for payments
export const ADMIN_CONTACT = "@wrnwtnwtn";

interface AccessControlState {
  hasPaid: boolean;
  isLoading: boolean;
  telegramId: string | null;
  telegramUsername: string | null;
}

export function useAccessControl() {
  const { user, isReady, isTelegram } = useTelegram();
  const [state, setState] = useState<AccessControlState>({
    hasPaid: false,
    isLoading: true,
    telegramId: null,
    telegramUsername: null,
  });

  const checkAccess = useCallback(async () => {
    // In development mode (not in Telegram), grant access
    if (!isTelegram && isReady) {
      setState({
        hasPaid: true,
        isLoading: false,
        telegramId: "dev_user",
        telegramUsername: "dev_mode",
      });
      return;
    }

    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: !isReady }));
      return;
    }

    const telegramId = String(user.id);
    const telegramUsername = user.username || null;

    try {
      const { data, error } = await supabase
        .from("paid_users")
        .select("id")
        .eq("telegram_id", telegramId)
        .maybeSingle();

      if (error) {
        console.error("Error checking paid status:", error);
      }

      setState({
        hasPaid: !!data,
        isLoading: false,
        telegramId,
        telegramUsername,
      });
    } catch (error) {
      console.error("Error in checkAccess:", error);
      setState({
        hasPaid: false,
        isLoading: false,
        telegramId,
        telegramUsername,
      });
    }
  }, [user, isReady, isTelegram]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const refreshAccess = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    checkAccess();
  }, [checkAccess]);

  return {
    ...state,
    refreshAccess,
    // Helper to get paywall message
    paywallMessage: `Для использования AI-функций оформите доступ через ${ADMIN_CONTACT}`,
  };
}
