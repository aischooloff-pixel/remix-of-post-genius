import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { FileText, Plus, Trash2, Edit, Star, Copy } from "lucide-react";
import { toast } from "sonner";

interface SystemPrompt {
  id: string;
  name: string;
  promptText: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
}

const DEFAULT_PROMPT = `Ты — профессиональный автор постов для Telegram. Задача: по идее/бриффу сгенерировать 3 варианта поста:
1) Короткий крючок (hook) + практический совет, 1–3 предложения.
2) Развёрнутый гайд — 4–8 предложений, структурированные абзацы.
3) Продающий вариант с мягким CTA в конце (1–2 фразы).

Тон: {tone}
Длина: {length}
Цель: {goal}
Целевая аудитория: {target_audience}

Ограничения: максимум 3 эмодзи; результат должен быть совместим с MarkdownV2. Не придумывай фактов.`;

export function SystemPromptsManager() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([
    {
      id: "default",
      name: "Стандартный промпт",
      promptText: DEFAULT_PROMPT,
      isDefault: true,
      isPublic: true,
      createdAt: new Date(),
    },
  ]);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [newName, setNewName] = useState("");
  const [newPromptText, setNewPromptText] = useState("");

  const handleAddPrompt = () => {
    if (!newName.trim() || !newPromptText.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    const newPrompt: SystemPrompt = {
      id: Date.now().toString(),
      name: newName,
      promptText: newPromptText,
      isDefault: false,
      isPublic: false,
      createdAt: new Date(),
    };

    setPrompts([...prompts, newPrompt]);
    setNewName("");
    setNewPromptText("");
    setIsAddingPrompt(false);
    toast.success("Промпт создан!");
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt) return;

    setPrompts(
      prompts.map((p) =>
        p.id === editingPrompt.id ? editingPrompt : p
      )
    );
    setEditingPrompt(null);
    toast.success("Промпт обновлён!");
  };

  const handleDeletePrompt = (id: string) => {
    if (prompts.find((p) => p.id === id)?.isDefault) {
      toast.error("Нельзя удалить стандартный промпт");
      return;
    }
    setPrompts(prompts.filter((p) => p.id !== id));
    toast.success("Промпт удалён");
  };

  const handleSetDefault = (id: string) => {
    setPrompts(
      prompts.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
    toast.success("Промпт установлен по умолчанию");
  };

  const handleDuplicate = (prompt: SystemPrompt) => {
    const newPrompt: SystemPrompt = {
      ...prompt,
      id: Date.now().toString(),
      name: `${prompt.name} (копия)`,
      isDefault: false,
      createdAt: new Date(),
    };
    setPrompts([...prompts, newPrompt]);
    toast.success("Промпт скопирован!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Системные промпты</h2>
          <p className="text-sm text-muted-foreground">
            Шаблоны для генерации постов с AI
          </p>
        </div>
        <Dialog open={isAddingPrompt} onOpenChange={setIsAddingPrompt}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать промпт
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новый системный промпт</DialogTitle>
              <DialogDescription>
                Создайте шаблон для генерации постов
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  placeholder="Мой промпт"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Текст промпта</Label>
                <Textarea
                  id="prompt"
                  placeholder="Ты — профессиональный автор..."
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Используйте переменные: {"{tone}"}, {"{length}"}, {"{goal}"}, {"{target_audience}"}
                </p>
              </div>
              <Button onClick={handleAddPrompt} className="w-full">
                Создать промпт
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать промпт</DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={editingPrompt.name}
                  onChange={(e) =>
                    setEditingPrompt({ ...editingPrompt, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prompt">Текст промпта</Label>
                <Textarea
                  id="edit-prompt"
                  value={editingPrompt.promptText}
                  onChange={(e) =>
                    setEditingPrompt({ ...editingPrompt, promptText: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={handleUpdatePrompt} className="w-full">
                Сохранить изменения
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {prompt.name}
                      {prompt.isDefault && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {prompt.promptText.substring(0, 80)}...
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Создан: {prompt.createdAt.toLocaleDateString("ru-RU")}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(prompt)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPrompt(prompt)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!prompt.isDefault && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(prompt.id)}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePrompt(prompt.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
