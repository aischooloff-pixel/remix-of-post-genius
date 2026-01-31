import { useState, useRef } from "react";
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Video,
  File,
  X,
  Check,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostMedia } from "@/types/post";
import { toast } from "sonner";
import { useAI } from "@/hooks/useAI";
import { supabase } from "@/integrations/supabase/client";

interface MediaManagerProps {
  media: PostMedia[];
  onChange: (media: PostMedia[]) => void;
  onGenerate?: (prompt: string, options: GenerateOptions) => Promise<string[]>;
}

interface GenerateOptions {
  style: string;
  aspectRatio: string;
  count: number;
}

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 (Квадрат)" },
  { value: "16:9", label: "16:9 (Широкий)" },
  { value: "9:16", label: "9:16 (Вертикальный)" },
  { value: "4:3", label: "4:3 (Классический)" },
];

const STYLES = [
  { value: "realistic", label: "Реалистичный" },
  { value: "digital_art", label: "Цифровое искусство" },
  { value: "minimal", label: "Минималистичный" },
  { value: "3d", label: "3D рендер" },
  { value: "illustration", label: "Иллюстрация" },
];

export function MediaManager({ media, onChange }: MediaManagerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "generate">("upload");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [count, setCount] = useState(3);
  const [generatedImages, setGeneratedImages] = useState<Array<{ id: string; url: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generateImage, isGeneratingImage } = useAI();

  const uploadToStorage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newMedia: PostMedia[] = [];

    try {
      for (const file of Array.from(files)) {
        const publicUrl = await uploadToStorage(file);
        
        if (publicUrl) {
          const type = file.type.startsWith("video")
            ? "video"
            : file.type.startsWith("image")
            ? "photo"
            : "document";

          newMedia.push({
            id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            url: publicUrl,
            meta: {
              name: file.name,
              size: file.size,
            },
          });
        }
      }

      onChange([...media, ...newMedia]);
      toast.success(`Загружено ${newMedia.length} файл(ов)`);
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error("Ошибка загрузки файлов");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Введите описание изображения");
      return;
    }
    
    try {
      const styleLabel = STYLES.find(s => s.value === style)?.label || style;
      const images = await generateImage(prompt, styleLabel, count);
      setGeneratedImages(images.map(img => ({ id: img.id, url: img.url })));
      toast.success("Изображения сгенерированы!");
    } catch (error) {
      // Error already handled in useAI hook
    }
  };

  const selectGeneratedImage = (image: { id: string; url: string }) => {
    const newMedia: PostMedia = {
      id: image.id,
      type: "photo",
      url: image.url,
      generatedBy: "lovable-ai",
      meta: {
        prompt,
        style,
        aspectRatio,
      },
    };
    onChange([...media, newMedia]);
    toast.success("Изображение добавлено");
  };

  const removeMedia = (id: string) => {
    onChange(media.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        Медиа
      </Label>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Загрузить
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Сгенерировать
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed border-border rounded-xl p-8",
              "hover:border-primary/50 transition-colors cursor-pointer",
              "flex flex-col items-center justify-center gap-3",
              isUploading && "opacity-50 pointer-events-none"
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="font-medium">
                {isUploading ? "Загрузка..." : "Нажмите или перетащите файлы"}
              </p>
              <p className="text-sm text-muted-foreground">
                Фото, видео, GIF, документы
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.gif,.webm"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите изображение, которое хотите сгенерировать..."
              className="min-h-[80px]"
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Стиль</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Соотношение</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Количество</Label>
                <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "изображение" : "изображения"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGeneratingImage || !prompt.trim()}
              className="w-full bg-gradient-to-r from-primary to-purple-500"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать
                </>
              )}
            </Button>
          </div>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Сгенерированные изображения
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map((image) => (
                  <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => selectGeneratedImage(image)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image.url, "_blank")}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected Media */}
      {media.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Выбранные медиа ({media.length})
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {media.map((m) => (
              <div key={m.id} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary">
                {m.type === "photo" ? (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                ) : m.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <File className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(m.id)}
                >
                  <X className="w-4 h-4 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
