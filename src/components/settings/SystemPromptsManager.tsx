import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Trash2, Edit, Star, Copy, Loader2 } from "lucide-react";
import { useSystemPrompts } from "@/hooks/useSystemPrompts";

export function SystemPromptsManager() {
  const { prompts, loading, addPrompt, updatePrompt, deletePrompt, setDefaultPrompt, duplicatePrompt } = useSystemPrompts();
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; name: string; promptText: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPrompt = async () => {
    if (!newName.trim() || !newPromptText.trim()) {
      return;
    }

    setIsSaving(true);
    const result = await addPrompt(newName.trim(), newPromptText.trim());
    setIsSaving(false);

    if (result) {
      setNewName("");
      setNewPromptText("");
      setIsAddingPrompt(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;

    setIsSaving(true);
    const success = await updatePrompt(editingPrompt.id, {
      name: editingPrompt.name,
      promptText: editingPrompt.promptText,
    });
    setIsSaving(false);

    if (success) {
      setEditingPrompt(null);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    await deletePrompt(id);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPrompt(id);
  };

  const handleDuplicate = async (prompt: { id: string; name: string; promptText: string; isDefault: boolean; isPublic: boolean; createdAt: Date }) => {
    await duplicatePrompt(prompt);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <Button onClick={handleAddPrompt} className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать промпт"
                )}
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
              <Button onClick={handleUpdatePrompt} className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {prompts.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Нет промптов
              </p>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
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
                      onClick={() => setEditingPrompt({
                        id: prompt.id,
                        name: prompt.name,
                        promptText: prompt.promptText,
                      })}
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
          ))
        )}
      </div>
    </div>
  );
}
