import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface SystemPrompt {
  id: string;
  name: string;
  promptText: string;
  template: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
}

const STORAGE_KEY = "system_prompts";

const DEFAULT_PROMPT_TEXT = `Ты — профессиональный автор постов для Telegram. Задача: по идее/бриффу сгенерировать 3 варианта поста:
1) Короткий крючок (hook) + практический совет, 1–3 предложения.
2) Развёрнутый гайд — 4–8 предложений, структурированные абзацы.
3) Продающий вариант с мягким CTA в конце (1–2 фразы).

Тон: {tone}
Длина: {length}
Цель: {goal}
Целевая аудитория: {target_audience}

Ограничения: максимум 3 эмодзи; результат должен быть совместим с MarkdownV2. Не придумывай фактов.`;

const DEFAULT_TEMPLATE = `**Заголовок**

— пункт 1
— пункт 2
— пункт 3

_Вывод / призыв к действию_`;

const createDefaultPrompt = (): SystemPrompt => ({
  id: crypto.randomUUID(),
  name: "Стандартный промпт",
  promptText: DEFAULT_PROMPT_TEXT,
  template: DEFAULT_TEMPLATE,
  isDefault: true,
  isPublic: false,
  createdAt: new Date(),
});

export function useSystemPrompts() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPrompts(parsed.map((prompt: any) => ({
          ...prompt,
          template: prompt.template || "",
          createdAt: new Date(prompt.createdAt),
        })));
      } else {
        // Create default prompt
        const defaultPrompt = createDefaultPrompt();
        setPrompts([defaultPrompt]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultPrompt]));
      }
    } catch (error) {
      console.error("Error loading prompts:", error);
      const defaultPrompt = createDefaultPrompt();
      setPrompts([defaultPrompt]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = (newPrompts: SystemPrompt[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrompts));
  };

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const addPrompt = async (name: string, promptText: string, template: string = ""): Promise<SystemPrompt | null> => {
    const newPrompt: SystemPrompt = {
      id: crypto.randomUUID(),
      name,
      promptText,
      template,
      isDefault: false,
      isPublic: false,
      createdAt: new Date(),
    };

    const newPrompts = [...prompts, newPrompt];
    setPrompts(newPrompts);
    saveToStorage(newPrompts);
    
    toast.success("Промпт создан!");
    return newPrompt;
  };

  const updatePrompt = async (
    id: string,
    updates: { name?: string; promptText?: string; template?: string }
  ): Promise<boolean> => {
    const newPrompts = prompts.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setPrompts(newPrompts);
    saveToStorage(newPrompts);
    
    toast.success("Промпт обновлён!");
    return true;
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt?.isDefault) {
      toast.error("Нельзя удалить промпт по умолчанию");
      return false;
    }

    const newPrompts = prompts.filter((p) => p.id !== id);
    setPrompts(newPrompts);
    saveToStorage(newPrompts);
    
    toast.success("Промпт удалён");
    return true;
  };

  const setDefaultPrompt = async (id: string): Promise<boolean> => {
    const newPrompts = prompts.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    setPrompts(newPrompts);
    saveToStorage(newPrompts);
    
    toast.success("Промпт установлен по умолчанию");
    return true;
  };

  const duplicatePrompt = async (prompt: SystemPrompt): Promise<SystemPrompt | null> => {
    return addPrompt(`${prompt.name} (копия)`, prompt.promptText, prompt.template);
  };

  const getDefaultPrompt = (): SystemPrompt | undefined => {
    return prompts.find((p) => p.isDefault) || prompts[0];
  };

  const getPromptById = (id: string): SystemPrompt | undefined => {
    return prompts.find((p) => p.id === id);
  };

  return {
    prompts,
    loading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    setDefaultPrompt,
    duplicatePrompt,
    getDefaultPrompt,
    getPromptById,
    refetch: loadFromStorage,
  };
}
