import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { IdeaForm } from "@/components/post/IdeaForm";
import { VariantsList } from "@/components/post/VariantsList";
import { PostEditor } from "@/components/post/PostEditor";
import { TelegramPreview } from "@/components/post/TelegramPreview";
import { MediaManager } from "@/components/post/MediaManager";
import { ButtonsBuilder } from "@/components/post/ButtonsBuilder";
import { ScheduleWidget } from "@/components/post/ScheduleWidget";
import { Button } from "@/components/ui/button";
import { 
  IdeaFormData, 
  PostVariant, 
  PostMedia, 
  InlineButton,
} from "@/types/post";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight } from "lucide-react";

type Step = "idea" | "variants" | "edit";

export default function CreatePost() {
  const [step, setStep] = useState<Step>("idea");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [editedText, setEditedText] = useState("");
  const [editedMarkdown, setEditedMarkdown] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [buttons, setButtons] = useState<InlineButton[]>([]);

  const handleGenerateVariants = useCallback(async (data: IdeaFormData) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const mockVariants: PostVariant[] = [
      {
        id: "v1",
        label: "A",
        style: "hook",
        styleName: "Крючок + совет",
        text: `🎯 ${data.idea.slice(0, 50)}...\n\nЭто ключевой момент, который изменит ваш подход. Попробуйте применить это сегодня!`,
        textMarkdown: `🎯 **${data.idea.slice(0, 50)}...**\n\nЭто ключевой момент, который изменит ваш подход\\. Попробуйте применить это сегодня\\!`,
        textHtml: `🎯 <b>${data.idea.slice(0, 50)}...</b>\n\nЭто ключевой момент, который изменит ваш подход. Попробуйте применить это сегодня!`,
        tokensUsed: 45,
        createdAt: new Date(),
      },
      {
        id: "v2",
        label: "B",
        style: "guide",
        styleName: "Развёрнутый гайд",
        text: `📚 Полное руководство: ${data.idea.slice(0, 30)}...\n\nШаг 1: Определите цель\nШаг 2: Подготовьте план\nШаг 3: Начните с малого\nШаг 4: Анализируйте результаты\n\nГлавное — действовать последовательно и не сдаваться на полпути.`,
        textMarkdown: `📚 **Полное руководство:** _${data.idea.slice(0, 30)}\\.\\.\\._\n\n**Шаг 1:** Определите цель\n**Шаг 2:** Подготовьте план\n**Шаг 3:** Начните с малого\n**Шаг 4:** Анализируйте результаты\n\nГлавное — действовать последовательно и не сдаваться на полпути\\.`,
        textHtml: `📚 <b>Полное руководство:</b> <i>${data.idea.slice(0, 30)}...</i>\n\n<b>Шаг 1:</b> Определите цель\n<b>Шаг 2:</b> Подготовьте план\n<b>Шаг 3:</b> Начните с малого\n<b>Шаг 4:</b> Анализируйте результаты\n\nГлавное — действовать последовательно и не сдаваться на полпути.`,
        tokensUsed: 89,
        createdAt: new Date(),
      },
      {
        id: "v3",
        label: "C",
        style: "promo",
        styleName: "Продающий",
        text: `✨ ${data.idea.slice(0, 40)}...\n\nМы создали решение, которое уже помогло тысячам людей достичь результатов.\n\n→ Экономия времени\n→ Простота использования\n→ Гарантированный результат\n\n🔥 Начните прямо сейчас — подписывайтесь!`,
        textMarkdown: `✨ **${data.idea.slice(0, 40)}\\.\\.\\.**\n\nМы создали решение, которое уже помогло тысячам людей достичь результатов\\.\n\n→ Экономия времени\n→ Простота использования\n→ Гарантированный результат\n\n🔥 Начните прямо сейчас — подписывайтесь\\!`,
        textHtml: `✨ <b>${data.idea.slice(0, 40)}...</b>\n\nМы создали решение, которое уже помогло тысячам людей достичь результатов.\n\n→ Экономия времени\n→ Простота использования\n→ Гарантированный результат\n\n🔥 Начните прямо сейчас — подписывайтесь!`,
        tokensUsed: 78,
        createdAt: new Date(),
      },
    ];

    setVariants(mockVariants);
    setIsGenerating(false);
    setStep("variants");
    toast.success("Сгенерировано 3 варианта!");
  }, []);

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setEditedText(variant.text);
      setEditedMarkdown(variant.textMarkdown);
    }
  };

  const handleProceedToEdit = () => {
    if (!selectedVariantId) {
      toast.error("Выберите вариант");
      return;
    }
    setStep("edit");
  };

  const handlePublishNow = () => {
    toast.success("Пост отправлен в канал!");
  };

  const handleSchedule = (datetime: Date, timezone: string) => {
    toast.success(`Пост запланирован на ${datetime.toLocaleString("ru-RU")}`);
  };

  const handleAIEdit = async (instruction: string) => {
    toast.info(`Применяю: ${instruction}`);
    // Simulate AI edit
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEditedText((prev) => prev + "\n\n✏️ [Отредактировано AI]");
    toast.success("Текст обновлён!");
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className={step === "idea" ? "text-primary font-medium" : ""}>
              Идея
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={step === "variants" ? "text-primary font-medium" : ""}>
              Варианты
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={step === "edit" ? "text-primary font-medium" : ""}>
              Редактирование
            </span>
          </div>
          <h1 className="text-3xl font-bold">
            {step === "idea" && "Создать пост"}
            {step === "variants" && "Выберите вариант"}
            {step === "edit" && "Редактирование поста"}
          </h1>
        </div>

        {/* Step: Idea */}
        {step === "idea" && (
          <div className="max-w-2xl">
            <div className="glass-card rounded-2xl p-6">
              <IdeaForm onSubmit={handleGenerateVariants} isLoading={isGenerating} />
            </div>
          </div>
        )}

        {/* Step: Variants */}
        {step === "variants" && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setStep("idea")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к идее
            </Button>

            <VariantsList
              variants={variants}
              selectedVariantId={selectedVariantId}
              onSelectVariant={handleSelectVariant}
            />

            {selectedVariantId && (
              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-500"
                  onClick={handleProceedToEdit}
                >
                  Продолжить редактирование
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step: Edit */}
        {step === "edit" && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setStep("variants")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к вариантам
            </Button>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Editor Column */}
              <div className="xl:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <PostEditor
                    initialText={editedText}
                    initialMarkdown={editedMarkdown}
                    onTextChange={(text, markdown) => {
                      setEditedText(text);
                      setEditedMarkdown(markdown);
                    }}
                    onAIEdit={handleAIEdit}
                  />
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <MediaManager media={media} onChange={setMedia} />
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <ButtonsBuilder buttons={buttons} onChange={setButtons} />
                </div>
              </div>

              {/* Preview & Schedule Column */}
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Предпросмотр</h3>
                  <TelegramPreview
                    text={editedText}
                    media={media}
                    buttons={buttons}
                  />
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <ScheduleWidget
                    onPublishNow={handlePublishNow}
                    onSchedule={handleSchedule}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}