import { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Quote,
  Smile,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface PostEditorProps {
  initialText: string;
  initialMarkdown?: string;
  onTextChange: (text: string, markdown: string) => void;
  onAIEdit?: (instruction: string) => void;
  isAILoading?: boolean;
}

interface ToolbarButtonProps {
  icon: React.ElementType;
  tooltip: string;
  onClick: () => void;
  isActive?: boolean;
}

function ToolbarButton({ icon: Icon, tooltip, onClick, isActive }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={() => onClick()}
          className="h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        >
          <Icon className="h-4 w-4" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function PostEditor({
  initialText,
  initialMarkdown,
  onTextChange,
  onAIEdit,
  isAILoading,
}: PostEditorProps) {
  const [text, setText] = useState(initialText);
  const [markdownText, setMarkdownText] = useState(initialMarkdown || initialText);
  const [viewMode, setViewMode] = useState<"wysiwyg" | "markdown" | "html">("wysiwyg");
  const [aiInstruction, setAIInstruction] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  // Sync with external text changes (e.g., from AI editing)
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    setMarkdownText(initialMarkdown || initialText);
  }, [initialMarkdown, initialText]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    setMarkdownText(newText);
    onTextChange(newText, newText);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const before = text.slice(0, selectionStart);
    const selected = text.slice(selectionStart, selectionEnd);
    const after = text.slice(selectionEnd);
    
    if (selected) {
      const newText = `${before}${prefix}${selected}${suffix}${after}`;
      handleTextChange(newText);
    }
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case "bold":
        wrapSelection("**", "**");
        break;
      case "italic":
        wrapSelection("_", "_");
        break;
      case "strike":
        wrapSelection("~", "~");
        break;
      case "code":
        wrapSelection("`", "`");
        break;
      case "spoiler":
        wrapSelection("||", "||");
        break;
      case "quote":
        const lines = text.slice(selectionStart, selectionEnd).split("\n");
        const quoted = lines.map((l) => `> ${l}`).join("\n");
        const before = text.slice(0, selectionStart);
        const after = text.slice(selectionEnd);
        handleTextChange(`${before}${quoted}${after}`);
        break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    toast.success("Текст скопирован");
  };

  const handleOpenLinkPopover = () => {
    // Get selected text as link text
    const selectedText = text.slice(selectionStart, selectionEnd);
    setLinkText(selectedText || "");
    setLinkUrl("");
    setIsLinkPopoverOpen(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      toast.error("Введите URL ссылки");
      return;
    }

    const displayText = linkText.trim() || linkUrl;
    const before = text.slice(0, selectionStart);
    const after = text.slice(selectionEnd);
    const linkMarkdown = `[${displayText}](${linkUrl})`;
    
    handleTextChange(`${before}${linkMarkdown}${after}`);
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
    setLinkText("");
    toast.success("Ссылка добавлена");
  };

  const handleAISubmit = () => {
    if (aiInstruction.trim() && onAIEdit) {
      onAIEdit(aiInstruction);
      setAIInstruction("");
    }
  };

  const escapeMarkdownV2 = (text: string): string => {
    // Characters that need escaping in MarkdownV2
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let escaped = text;
    specialChars.forEach((char) => {
      escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
    });
    return escaped;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          <ToolbarButton
            icon={Bold}
            tooltip="Жирный (Ctrl+B)"
            onClick={() => handleFormat("bold")}
          />
          <ToolbarButton
            icon={Italic}
            tooltip="Курсив (Ctrl+I)"
            onClick={() => handleFormat("italic")}
          />
          <ToolbarButton
            icon={Strikethrough}
            tooltip="Зачёркнутый"
            onClick={() => handleFormat("strike")}
          />
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton
            icon={Code}
            tooltip="Код"
            onClick={() => handleFormat("code")}
          />
          <ToolbarButton
            icon={EyeOff}
            tooltip="Спойлер"
            onClick={() => handleFormat("spoiler")}
          />
          <ToolbarButton
            icon={Quote}
            tooltip="Цитата"
            onClick={() => handleFormat("quote")}
          />
          <div className="w-px h-5 bg-border mx-1" />
          <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <div>
                <ToolbarButton
                  icon={LinkIcon}
                  tooltip="Вставить ссылку"
                  onClick={handleOpenLinkPopover}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Вставить ссылку</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkText" className="text-xs">Текст ссылки</Label>
                  <Input
                    id="linkText"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Текст для отображения"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkUrl" className="text-xs">URL</Label>
                  <Input
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleInsertLink();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLinkPopoverOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button size="sm" onClick={handleInsertLink}>
                    Вставить
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <ToolbarButton
            icon={Smile}
            tooltip="Эмодзи"
            onClick={() => {
              toast.info("Используйте системную клавиатуру эмодзи (Win+. или Cmd+Ctrl+Space)");
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="wysiwyg" className="text-xs px-3 h-6">
                Редактор
              </TabsTrigger>
              <TabsTrigger value="markdown" className="text-xs px-3 h-6">
                MarkdownV2
              </TabsTrigger>
              <TabsTrigger value="html" className="text-xs px-3 h-6">
                HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {viewMode === "wysiwyg" && (
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              setSelectionStart(target.selectionStart);
              setSelectionEnd(target.selectionEnd);
            }}
            className="min-h-[200px] resize-none bg-secondary/30 border-border/50 focus:border-primary font-sans"
            placeholder="Введите или отредактируйте текст поста..."
          />
        )}
        
        {viewMode === "markdown" && (
          <div className="space-y-2">
            <Textarea
              value={markdownText}
              onChange={(e) => {
                setMarkdownText(e.target.value);
                onTextChange(e.target.value, e.target.value);
              }}
              className="min-h-[200px] resize-none bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm"
              placeholder="MarkdownV2 разметка..."
            />
            <p className="text-xs text-muted-foreground">
              💡 Спецсимволы нужно экранировать: {'`_*[]()~>#+-=|{}.!`'}
            </p>
          </div>
        )}
        
        {viewMode === "html" && (
          <Textarea
            value={`<b>bold</b>, <i>italic</i>, <s>strike</s>, <code>code</code>, <tg-spoiler>spoiler</tg-spoiler>`}
            readOnly
            className="min-h-[200px] resize-none bg-secondary/30 border-border/50 font-mono text-sm"
          />
        )}
      </div>

      {/* AI Edit */}
      {onAIEdit && (
        <div className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20">
          <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-редактирование
          </Label>
          <div className="flex gap-2">
            <Input
              value={aiInstruction}
              onChange={(e) => setAIInstruction(e.target.value)}
              placeholder="Например: сделай короче, добавь CTA, убери эмодзи..."
              className="flex-1 bg-background/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAISubmit();
                }
              }}
            />
            <Button
              onClick={handleAISubmit}
              disabled={!aiInstruction.trim() || isAILoading}
              className="bg-gradient-to-r from-primary to-purple-500"
            >
              {isAILoading ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Применить
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Character Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{text.length} символов</span>
        <span className={cn(text.length > 4096 && "text-destructive font-medium")}>
          {text.length > 4096 ? "⚠️ Превышен лимит 4096 символов" : "Лимит: 4096 символов"}
        </span>
      </div>
    </div>
  );
}