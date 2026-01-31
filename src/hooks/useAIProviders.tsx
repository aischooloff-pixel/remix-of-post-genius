import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIProvider {
  id: string;
  name: string;
  providerType: string;
  apiKey: string;
  endpointUrl: string;
  modelId: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

export function useAIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ai_providers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        providerType: p.provider_type,
        apiKey: p.api_key,
        endpointUrl: p.endpoint_url,
        modelId: p.model_id,
        isDefault: p.is_default,
        isActive: p.is_active,
        createdAt: new Date(p.created_at),
      }));

      setProviders(mapped);
    } catch (error: any) {
      console.error("Error fetching AI providers:", error);
      toast.error("Ошибка загрузки провайдеров");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const addProvider = async (
    name: string,
    providerType: string,
    apiKey: string,
    endpointUrl: string,
    modelId: string
  ): Promise<AIProvider | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Необходимо войти в систему");
        return null;
      }

      const { data, error } = await supabase
        .from("ai_providers")
        .insert({
          user_id: user.id,
          name,
          provider_type: providerType,
          api_key: apiKey,
          endpoint_url: endpointUrl,
          model_id: modelId,
          is_default: providers.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newProvider: AIProvider = {
        id: data.id,
        name: data.name,
        providerType: data.provider_type,
        apiKey: data.api_key,
        endpointUrl: data.endpoint_url,
        modelId: data.model_id,
        isDefault: data.is_default,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };

      setProviders((prev) => [newProvider, ...prev]);
      toast.success("Провайдер добавлен");
      return newProvider;
    } catch (error: any) {
      console.error("Error adding provider:", error);
      toast.error("Ошибка добавления провайдера");
      return null;
    }
  };

  const updateProvider = async (
    id: string,
    updates: Partial<{
      name: string;
      providerType: string;
      apiKey: string;
      endpointUrl: string;
      modelId: string;
      isActive: boolean;
    }>
  ): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.providerType !== undefined) dbUpdates.provider_type = updates.providerType;
      if (updates.apiKey !== undefined) dbUpdates.api_key = updates.apiKey;
      if (updates.endpointUrl !== undefined) dbUpdates.endpoint_url = updates.endpointUrl;
      if (updates.modelId !== undefined) dbUpdates.model_id = updates.modelId;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from("ai_providers")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;

      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      toast.success("Провайдер обновлён");
      return true;
    } catch (error: any) {
      console.error("Error updating provider:", error);
      toast.error("Ошибка обновления провайдера");
      return false;
    }
  };

  const deleteProvider = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("ai_providers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProviders((prev) => prev.filter((p) => p.id !== id));
      toast.success("Провайдер удалён");
      return true;
    } catch (error: any) {
      console.error("Error deleting provider:", error);
      toast.error("Ошибка удаления провайдера");
      return false;
    }
  };

  const setDefaultProvider = async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Remove default from all
      await supabase
        .from("ai_providers")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Set new default
      const { error } = await supabase
        .from("ai_providers")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      setProviders((prev) =>
        prev.map((p) => ({ ...p, isDefault: p.id === id }))
      );
      toast.success("Провайдер по умолчанию изменён");
      return true;
    } catch (error: any) {
      console.error("Error setting default provider:", error);
      toast.error("Ошибка");
      return false;
    }
  };

  const getDefaultProvider = (): AIProvider | undefined => {
    return providers.find((p) => p.isDefault && p.isActive);
  };

  return {
    providers,
    loading,
    addProvider,
    updateProvider,
    deleteProvider,
    setDefaultProvider,
    getDefaultProvider,
    refetch: fetchProviders,
  };
}
