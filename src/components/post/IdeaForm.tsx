import { useState, useEffect } from "react";
import { Sparkles, Target, Users, MessageSquare, Ruler, FileText, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  IdeaFormData,
  ToneOption,
  LengthOption,
  TONE_LABELS,
  LENGTH_LABELS,
} from "@/types/post";

const TEMPLATE_STORAGE_KEY = "post_template";
const DEFAULT_TEMPLATE = `Заголовок

— пункт 1
— пункт 2
— пункт 3

Вывод / призыв к действию`;

interface IdeaFormProps {
  onSubmit: (data: IdeaFormData) => void;
  isLoading?: boolean;
}

export function IdeaForm({ onSubmit, isLoading }: IdeaFormProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [template, setTemplate] = useState("");
  
  // Load saved template on mount
  useEffect(() => {
    const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (saved) {
      setTemplate(saved);
    }
  }, []);

  const [formData, setFormData] = useState<IdeaFormData>({
    idea: "",
    tone: "info",
    length: "medium",
    goal: "",
    targetAudience: "",
  });

  const handleSaveTemplate = () => {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, template);
    toast.success("Шаблон сохранён");
  };

  const handleResetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, DEFAULT_TEMPLATE);
    toast.success("Шаблон сброшен");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, template: template || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Idea */}
      <div className="space-y-3">
        <Label htmlFor="idea" className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Идея поста
        </Label>
        <Textarea
          id="idea"
          placeholder="Опишите идею поста, о чём хотите рассказать аудитории..."
          value={formData.idea}
          onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
          className="min-h-[120px] resize-none bg-secondary/50 border-border/50 focus:border-primary"
          required
        />
        <p className="text-xs text-muted-foreground">
          Чем подробнее опишете — тем лучше результат
        </p>
      </div>

      {/* Template Section */}
      <Collapsible open={templateOpen} onOpenChange={setTemplateOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between bg-secondary/50 border-border/50"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Шаблон структуры поста
            </span>
            <span className="text-xs text-muted-foreground">
              {template ? "Настроен" : "Не задан"}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <Textarea
            placeholder={DEFAULT_TEMPLATE}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="min-h-[140px] resize-none bg-secondary/50 border-border/50 focus:border-primary font-mono text-sm"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Форматирование:</span>
            <code className="bg-muted px-1.5 py-0.5 rounded">**жирный**</code>
            <code className="bg-muted px-1.5 py-0.5 rounded">_курсив_</code>
            <code className="bg-muted px-1.5 py-0.5 rounded">[ссылка](url)</code>
            <code className="bg-muted px-1.5 py-0.5 rounded">||скрытый||</code>
            <code className="bg-muted px-1.5 py-0.5 rounded">&gt; цитата</code>
            <code className="bg-muted px-1.5 py-0.5 rounded">— список</code>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSaveTemplate}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-1" />
              Сохранить
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetTemplate}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Сбросить
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tone */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Тон
          </Label>
          <Select
            value={formData.tone}
            onValueChange={(value: ToneOption) =>
              setFormData({ ...formData, tone: value })
            }
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TONE_LABELS) as ToneOption[]).map((tone) => (
                <SelectItem key={tone} value={tone}>
                  {TONE_LABELS[tone]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Length */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            Длина
          </Label>
          <Select
            value={formData.length}
            onValueChange={(value: LengthOption) =>
              setFormData({ ...formData, length: value })
            }
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LENGTH_LABELS) as LengthOption[]).map((length) => (
                <SelectItem key={length} value={length}>
                  {LENGTH_LABELS[length]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <Label htmlFor="goal" className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Цель (опционально)
          </Label>
          <Input
            id="goal"
            placeholder="Например: увеличить подписки"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="bg-secondary/50"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="audience" className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Целевая аудитория (опционально)
          </Label>
          <Input
            id="audience"
            placeholder="Например: предприниматели 25-40 лет"
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData({ ...formData, targetAudience: e.target.value })
            }
            className="bg-secondary/50"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity"
        disabled={!formData.idea.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Генерация...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Сгенерировать 3 варианта
          </>
        )}
      </Button>
    </form>
  );
}