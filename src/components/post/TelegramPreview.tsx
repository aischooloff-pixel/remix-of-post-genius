import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostMedia, InlineButton } from "@/types/post";

interface TelegramPreviewProps {
  text: string;
  media?: PostMedia[];
  buttons?: InlineButton[];
  channelName?: string;
}

export function TelegramPreview({
  text,
  media,
  buttons,
  channelName = "Ваш канал",
}: TelegramPreviewProps) {
  // Convert markdown to HTML-like preview
  const formatText = (text: string): string => {
    let formatted = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      // Italic
      .replace(/_(.*?)_/g, '<span class="italic">$1</span>')
      // Strikethrough
      .replace(/~(.*?)~/g, '<span class="line-through">$1</span>')
      // Code
      .replace(/`(.*?)`/g, '<span class="font-mono bg-black/30 px-1 rounded text-sm">$1</span>')
      // Spoiler - show as blurred
      .replace(/\|\|(.*?)\|\|/g, '<span class="blur-sm hover:blur-none transition-all cursor-pointer">$1</span>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-telegram-link hover:underline">$1</a>')
      // Blockquote
      .replace(/^> (.*)$/gm, '<div class="border-l-2 border-telegram-link/50 pl-2 text-muted-foreground">$1</div>')
      // Line breaks
      .replace(/\n/g, '<br />');
    
    return formatted;
  };

  // Group buttons by row
  const buttonRows = buttons?.reduce((acc, btn) => {
    if (!acc[btn.row]) acc[btn.row] = [];
    acc[btn.row].push(btn);
    return acc;
  }, {} as Record<number, InlineButton[]>);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Telegram Frame */}
      <div className="telegram-preview rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            {channelName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-white">{channelName}</h4>
            <p className="text-xs text-gray-400">канал</p>
          </div>
        </div>

        {/* Message */}
        <div className="p-4 space-y-3">
          {/* Media */}
          {media && media.length > 0 && (
            <div className={cn(
              "rounded-lg overflow-hidden",
              media.length > 1 && "grid grid-cols-2 gap-1"
            )}>
              {media.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="aspect-video bg-gray-700 flex items-center justify-center"
                >
                  {m.type === "photo" ? (
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">
                      {m.type === "video" ? "🎬 Видео" : "📄 Документ"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text */}
          <div
            className="text-telegram-text text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(text) }}
          />

          {/* Inline Buttons */}
          {buttonRows && Object.keys(buttonRows).length > 0 && (
            <div className="space-y-1 mt-3">
              {Object.entries(buttonRows)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([row, btns]) => (
                  <div key={row} className="flex gap-1">
                    {btns.map((btn) => (
                      <button
                        key={btn.id}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                          "bg-[#2f3136] hover:bg-[#3d4145] text-telegram-link",
                          "flex items-center justify-center gap-1"
                        )}
                      >
                        {btn.text}
                        {btn.type === "url" && (
                          <ExternalLink className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex justify-end">
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Label */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Предпросмотр в стиле Telegram
      </p>
    </div>
  );
}