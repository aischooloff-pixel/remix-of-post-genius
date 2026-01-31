import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Trash2, Edit, Star, Copy, Loader2, LayoutTemplate } from "lucide-react";
import { useSystemPrompts, SystemPrompt } from "@/hooks/useSystemPrompts";

export function SystemPromptsManager() {
  const { prompts, loading, addPrompt, updatePrompt, deletePrompt, setDefaultPrompt, duplicatePrompt } = useSystemPrompts();
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; name: string; promptText: string; template: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPrompt = async () => {
    if (!newName.trim() || !newPromptText.trim()) {
      return;
    }

    setIsSaving(true);
    const result = await addPrompt(newName.trim(), newPromptText.trim(), newTemplate.trim());
    setIsSaving(false);

    if (result) {
      setNewName("");
      setNewPromptText("");
      setNewTemplate("");
      setIsAddingPrompt(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;

    setIsSaving(true);
    const success = await updatePrompt(editingPrompt.id, {
      name: editingPrompt.name,
      promptText: editingPrompt.promptText,
      template: editingPrompt.template,
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

  const handleDuplicate = async (prompt: SystemPrompt) => {
    await duplicatePrompt(prompt);
  };

  const handleEdit = (prompt: SystemPrompt) => {
    setEditingPrompt({
      id: prompt.id,
      name: prompt.name,
      promptText: prompt.promptText,
      template: prompt.template || "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const PromptFormContent = ({ 
    name, 
    setName, 
    promptText, 
    setPromptText, 
    template, 
    setTemplate,
    onSave,
    isSaving,
    buttonText,
  }: {
    name: string;
    setName: (v: string) => void;
    promptText: string;
    setPromptText: (v: string) => void;
    template: string;
    setTemplate: (v: string) => void;
    onSave: () => void;
    isSaving: boolean;
    buttonText: string;
  }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          placeholder="Мой промпт"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Промпт
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" />
            Шаблон
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt" className="space-y-2 mt-4">
          <Label htmlFor="prompt">Системный промпт для AI</Label>
          <Textarea
            id="prompt"
            placeholder="Ты — профессиональный автор..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Переменные: {"{tone}"}, {"{length}"}, {"{goal}"}, {"{target_audience}"}
          </p>
        </TabsContent>
        
        <TabsContent value="template" className="space-y-2 mt-4">
          <Label htmlFor="template">Структура поста</Label>
          <Textarea
            id="template"
            placeholder={`**Заголовок**\n\n— пункт 1\n— пункт 2\n\n_Вывод_`}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Форматирование Telegram:
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <code className="bg-muted px-1.5 py-0.5 rounded">**жирный**</code>
              <code className="bg-muted px-1.5 py-0.5 rounded">_курсив_</code>
              <code className="bg-muted px-1.5 py-0.5 rounded">[ссылка](url)</code>
              <code className="bg-muted px-1.5 py-0.5 rounded">— список</code>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Button onClick={onSave} className="w-full" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Сохранение...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Системные промпты</h2>
          <p className="text-sm text-muted-foreground">
            Шаблоны и промпты для генерации постов
          </p>
        </div>
        <Dialog open={isAddingPrompt} onOpenChange={setIsAddingPrompt}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать промпт
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новый системный промпт</DialogTitle>
              <DialogDescription>
                Создайте промпт и шаблон структуры для генерации постов
              </DialogDescription>
            </DialogHeader>
            <PromptFormContent
              name={newName}
              setName={setNewName}
              promptText={newPromptText}
              setPromptText={setNewPromptText}
              template={newTemplate}
              setTemplate={setNewTemplate}
              onSave={handleAddPrompt}
              isSaving={isSaving}
              buttonText="Создать промпт"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать промпт</DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <PromptFormContent
              name={editingPrompt.name}
              setName={(v) => setEditingPrompt({ ...editingPrompt, name: v })}
              promptText={editingPrompt.promptText}
              setPromptText={(v) => setEditingPrompt({ ...editingPrompt, promptText: v })}
              template={editingPrompt.template}
              setTemplate={(v) => setEditingPrompt({ ...editingPrompt, template: v })}
              onSave={handleUpdatePrompt}
              isSaving={isSaving}
              buttonText="Сохранить изменения"
            />
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
                        {prompt.template && (
                          <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
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
                    {prompt.template ? "С шаблоном • " : ""}
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
                      onClick={() => handleEdit(prompt)}
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
