import { useState } from "react";
import { Sparkles, Target, Users, MessageSquare, Ruler } from "lucide-react";
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
  IdeaFormData,
  ToneOption,
  LengthOption,
  TONE_LABELS,
  LENGTH_LABELS,
} from "@/types/post";

interface IdeaFormProps {
  onSubmit: (data: IdeaFormData) => void;
  isLoading?: boolean;
}

export function IdeaForm({ onSubmit, isLoading }: IdeaFormProps) {
  const [formData, setFormData] = useState<IdeaFormData>({
    idea: "",
    tone: "info",
    length: "medium",
    goal: "",
    targetAudience: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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