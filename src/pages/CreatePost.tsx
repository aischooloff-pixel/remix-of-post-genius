import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { IdeaForm } from "@/components/post/IdeaForm";

import { PostEditor } from "@/components/post/PostEditor";
import { TelegramPreview } from "@/components/post/TelegramPreview";
import { MediaManager } from "@/components/post/MediaManager";
import { ButtonsBuilder } from "@/components/post/ButtonsBuilder";
import { ScheduleWidget } from "@/components/post/ScheduleWidget";
import { ChannelSelector } from "@/components/post/ChannelSelector";
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
import { usePosts } from "@/contexts/PostsContext";
import { useBots } from "@/hooks/useBots";
import { useChannels } from "@/hooks/useChannels";
import { supabase } from "@/integrations/supabase/client";
import { markdownToTelegramHtml } from "@/lib/telegram-formatter";

type Step = "idea" | "edit";

interface SelectedChannel {
  id: string;
  channelId: string;
  channelTitle: string;
  botToken: string;
  botTokenId: string;
}

export default function CreatePost() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editPostId = searchParams.get("edit");
  
  const [step, setStep] = useState<Step>("idea");
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [ideaData, setIdeaData] = useState<IdeaFormData | null>(null);
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [editedText, setEditedText] = useState("");
  const [editedMarkdown, setEditedMarkdown] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [buttons, setButtons] = useState<InlineButton[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SelectedChannel | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const { generateVariants, editByAI, isGeneratingVariants } = useAI();
  const { posts, createPost, updatePost } = usePosts();
  const { bots } = useBots();
  const { channels } = useChannels();

  // Load post for editing
  useEffect(() => {
    if (editPostId) {
      const post = posts.find(p => p.id === editPostId);
      if (post && post.status === "draft") {
        setCurrentPostId(post.id);
        setIdeaData({
          idea: post.ideaText,
          tone: post.tone || "info",
          length: post.length || "medium",
          goal: post.goal || "",
          targetAudience: post.targetAudience || "",
          systemPromptId: post.systemPromptId || undefined,
          variantsCount: 1,
        });
        
        if (post.variants && post.variants.length > 0) {
          setVariants(post.variants);
          
          if (post.chosenVariantId) {
            setSelectedVariantId(post.chosenVariantId);
            const variant = post.variants.find(v => v.id === post.chosenVariantId);
            if (variant) {
              setEditedText(post.editedTextMarkdown || variant.textMarkdown);
              setEditedMarkdown(post.editedTextMarkdown || variant.textMarkdown);
            }
            setStep("edit");
          } else {
            setStep("idea");
          }
        } else {
          setStep("idea");
        }
        
        setMedia(post.media || []);
        setButtons(post.buttons || []);
        
        toast.info("Редактирование черновика");
      }
    }
  }, [editPostId, posts]);

  const handleGenerateVariants = useCallback(async (data: IdeaFormData) => {
    try {
      // Create post in database
      const post = await createPost({
        ideaText: data.idea,
        tone: data.tone,
        length: data.length,
        goal: data.goal,
        targetAudience: data.targetAudience,
        systemPromptId: data.systemPromptId,
      });

      if (post) {
        setCurrentPostId(post.id);
      }

      setIdeaData(data);
      const generatedVariants = await generateVariants(data);
      setVariants(generatedVariants);
      
      // Auto-select the first (only) variant and go directly to edit
      const firstVariant = generatedVariants[0];
      if (firstVariant) {
        setSelectedVariantId(firstVariant.id);
        setEditedText(firstVariant.text);
        setEditedMarkdown(firstVariant.textMarkdown);
        
        // Save to database
        if (post) {
          await updatePost(post.id, { 
            variants: generatedVariants,
            chosenVariantId: firstVariant.id,
            editedTextMarkdown: firstVariant.textMarkdown,
            editedTextHtml: firstVariant.textHtml,
          });
        }
        
        setStep("edit");
        toast.success("Пост сгенерирован!");
      }
    } catch (error) {
      // Error already handled in useAI hook
    }
  }, [generateVariants, createPost, updatePost]);

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setEditedText(variant.text);
      setEditedMarkdown(variant.textMarkdown);
    }
  };

  const handleProceedToEdit = async () => {
    if (!selectedVariantId) {
      toast.error("Выберите вариант");
      return;
    }
    
    // Save chosen variant to database
    if (currentPostId) {
      const variant = variants.find((v) => v.id === selectedVariantId);
      await updatePost(currentPostId, { 
        chosenVariantId: selectedVariantId,
        editedTextMarkdown: variant?.textMarkdown,
        editedTextHtml: variant?.textHtml,
      });
    }
    
    setStep("edit");
  };

  const handlePublishNow = async () => {
    if (!selectedChannel) {
      toast.error("Выберите канал для публикации");
      return;
    }

    if (!editedText.trim()) {
      toast.error("Текст поста не может быть пустым");
      return;
    }

    setIsPublishing(true);

    try {
      // Update post status to sending
      if (currentPostId) {
        await updatePost(currentPostId, { 
          status: "sending",
          channelId: selectedChannel.id,
          media,
          buttons,
          editedTextMarkdown: editedMarkdown,
        });
      }

      // Convert markdown to HTML for Telegram
      const htmlText = markdownToTelegramHtml(editedText);

      const { data, error } = await supabase.functions.invoke('publish-post', {
        body: {
          botToken: selectedChannel.botToken,
          chatId: selectedChannel.channelId,
          text: htmlText,
          parseMode: 'HTML',
          media: media.length > 0 ? media.map(m => ({
            type: m.type,
            url: m.url,
          })) : undefined,
          buttons: buttons.length > 0 ? buttons.map(b => ({
            text: b.text,
            url: b.type === 'url' ? b.payload : undefined,
            callback_data: b.type === 'callback' ? b.payload : undefined,
            row: b.row,
          })) : undefined,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Update post status to sent
      if (currentPostId) {
        await updatePost(currentPostId, { 
          status: "sent",
          telegramMessageId: data.messageId,
          sentAt: new Date(),
        });
      }

      toast.success("Пост успешно опубликован в канал!");
      
      // Reset form
      resetForm();
    } catch (error: any) {
      console.error("Publish error:", error);
      
      // Update post status to failed
      if (currentPostId) {
        await updatePost(currentPostId, { 
          status: "failed",
          errorMessage: error.message,
        });
      }
      
      toast.error(`Ошибка публикации: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async (datetime: Date) => {
    if (!selectedChannel) {
      toast.error("Выберите канал для публикации");
      return;
    }

    if (!editedText.trim()) {
      toast.error("Текст поста не может быть пустым");
      return;
    }

    // Check if schedule time is at least 1 minute in the future
    const now = Date.now();
    const scheduleTime = datetime.getTime();
    if (scheduleTime <= now + 60000) {
      toast.error("Время публикации должно быть минимум через 1 минуту");
      return;
    }

    setIsPublishing(true);

    try {
      // Convert markdown to HTML for Telegram
      const htmlText = markdownToTelegramHtml(editedText);

      // Save post with scheduled status - the cron function will send it
      if (currentPostId) {
        await updatePost(currentPostId, { 
          status: "scheduled",
          channelId: selectedChannel.id,
          botTokenId: selectedChannel.botTokenId, // Need to save bot token reference
          scheduleDatetime: datetime,
          media,
          buttons,
          editedTextMarkdown: editedMarkdown,
          editedTextHtml: htmlText,
        });
      }

      toast.success(`Пост запланирован на ${datetime.toLocaleString("ru-RU")}. Он будет отправлен автоматически.`);
      resetForm();
    } catch (error: any) {
      console.error("Schedule error:", error);
      
      if (currentPostId) {
        await updatePost(currentPostId, { 
          status: "failed",
          errorMessage: error.message,
        });
      }
      
      toast.error(`Ошибка планирования: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setStep("idea");
    setCurrentPostId(null);
    setIdeaData(null);
    setVariants([]);
    setSelectedVariantId(undefined);
    setEditedText("");
    setEditedMarkdown("");
    setMedia([]);
    setButtons([]);
    setSelectedChannel(null);
    // Clear edit param from URL
    navigate("/", { replace: true });
  };

  const handleAIEdit = async (instruction: string) => {
    toast.info(`Применяю: ${instruction}`);
    try {
      const result = await editByAI(editedText, instruction);
      setEditedText(result.text);
      setEditedMarkdown(result.textMarkdown);
      
      // Save to database
      if (currentPostId) {
        await updatePost(currentPostId, { 
          editedTextMarkdown: result.textMarkdown,
          editedTextHtml: result.textHtml,
        });
      }
      
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
            <span className={step === "edit" ? "text-primary font-medium" : ""}>
              Редактирование
            </span>
          </div>
          <h1 className="text-3xl font-bold">
            {step === "idea" && "Создать пост"}
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

        {/* Step: Edit */}
        {step === "edit" && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setStep("idea")}>
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
                  <ChannelSelector
                    selectedChannel={selectedChannel}
                    onSelect={setSelectedChannel}
                  />
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <ScheduleWidget
                    onPublishNow={handlePublishNow}
                    onSchedule={handleSchedule}
                    isPublishing={isPublishing}
                  />
                  
                  {!selectedChannel && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-400">
                        ⚠️ Для публикации добавьте бота и канал в{" "}
                        <Link to="/settings" className="underline hover:text-yellow-300">
                          настройках
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
