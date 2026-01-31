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
import { useAI } from "@/hooks/useAI";

type Step = "idea" | "variants" | "edit";

export default function CreatePost() {
  const [step, setStep] = useState<Step>("idea");
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [editedText, setEditedText] = useState("");
  const [editedMarkdown, setEditedMarkdown] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [buttons, setButtons] = useState<InlineButton[]>([]);
  
  const { generateVariants, editByAI, isGeneratingVariants, isEditing } = useAI();

  const handleGenerateVariants = useCallback(async (data: IdeaFormData) => {
    try {
      const generatedVariants = await generateVariants(data);
      setVariants(generatedVariants);
      setStep("variants");
      toast.success(`Сгенерировано ${generatedVariants.length} варианта!`);
    } catch (error) {
      // Error already handled in useAI hook
    }
  }, [generateVariants]);

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
    try {
      const result = await editByAI(editedText, instruction);
      setEditedText(result.text);
      setEditedMarkdown(result.textMarkdown);
      toast.success("Текст обновлён!");
    } catch (error) {
      // Error already handled in useAI hook
    }
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
              <IdeaForm onSubmit={handleGenerateVariants} isLoading={isGeneratingVariants} />
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