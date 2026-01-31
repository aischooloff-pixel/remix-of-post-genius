import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Bot, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SelectedChannel {
  id: string;
  channelId: string;
  channelTitle: string;
  botToken: string;
}

interface StoredChannel {
  id: string;
  channelId: string;
  channelTitle: string;
  channelUsername: string;
  botToken: string;
  botName: string;
}

interface ChannelSelectorProps {
  selectedChannel: SelectedChannel | null;
  onSelect: (channel: SelectedChannel | null) => void;
}

const STORAGE_KEY = 'telepost_channels';

export function ChannelSelector({ selectedChannel, onSelect }: ChannelSelectorProps) {
  const [channels, setChannels] = useState<StoredChannel[]>([]);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Load channels from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setChannels(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save channels to localStorage when changed
  const saveChannels = (newChannels: StoredChannel[]) => {
    setChannels(newChannels);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newChannels));
  };

  const handleAddChannel = async () => {
    if (!botToken.trim() || !channelId.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setIsValidating(true);

    try {
      // Validate bot token by calling getMe
      const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const botData = await botResponse.json();
      
      if (!botData.ok) {
        throw new Error("Неверный токен бота");
      }

      // Try to get chat info to validate channel
      const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${channelId}`);
      const chatData = await chatResponse.json();
      
      if (!chatData.ok) {
        throw new Error(chatData.description || "Не удалось получить информацию о канале. Убедитесь, что бот добавлен в канал как администратор.");
      }

      const newChannel: StoredChannel = {
        id: Date.now().toString(),
        channelId: String(chatData.result.id),
        channelTitle: chatData.result.title || channelId,
        channelUsername: chatData.result.username ? `@${chatData.result.username}` : channelId,
        botToken: botToken,
        botName: botData.result.first_name || `@${botData.result.username}`,
      };

      const newChannels = [...channels, newChannel];
      saveChannels(newChannels);

      // Auto-select the new channel
      onSelect({
        id: newChannel.id,
        channelId: newChannel.channelId,
        channelTitle: newChannel.channelTitle,
        botToken: newChannel.botToken,
      });

      setBotToken("");
      setChannelId("");
      setIsAddingChannel(false);
      toast.success("Канал успешно добавлен!");
    } catch (error: any) {
      toast.error(error.message || "Ошибка валидации");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSelectChannel = (channelId: string) => {
    if (channelId === "none") {
      onSelect(null);
      return;
    }

    const channel = channels.find((c) => c.id === channelId);
    if (channel) {
      onSelect({
        id: channel.id,
        channelId: channel.channelId,
        channelTitle: channel.channelTitle,
        botToken: channel.botToken,
      });
    }
  };

  const handleRemoveChannel = (id: string) => {
    const newChannels = channels.filter((c) => c.id !== id);
    saveChannels(newChannels);
    if (selectedChannel?.id === id) {
      onSelect(null);
    }
    toast.success("Канал удалён");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Канал для публикации
        </Label>
        <Dialog open={isAddingChannel} onOpenChange={setIsAddingChannel}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить канал</DialogTitle>
              <DialogDescription>
                Введите токен бота и ID/username канала
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bot-token">Bot Token (от @BotFather)</Label>
                <div className="relative">
                  <Input
                    id="bot-token"
                    type={showToken ? "text" : "password"}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel-id">ID или @username канала</Label>
                <Input
                  id="channel-id"
                  placeholder="@my_channel или -1001234567890"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Бот должен быть администратором канала с правами публикации
                </p>
              </div>
              <Button
                onClick={handleAddChannel}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  "Добавить канал"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Bot className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Добавьте канал для публикации
            </p>
          </CardContent>
        </Card>
      ) : (
        <Select
          value={selectedChannel?.id || "none"}
          onValueChange={handleSelectChannel}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите канал" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Не выбран</SelectItem>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{channel.channelTitle}</span>
                  <span className="text-muted-foreground text-xs">
                    ({channel.botName})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {selectedChannel && (
        <p className="text-xs text-muted-foreground">
          Публикация в: <strong>{selectedChannel.channelTitle}</strong>
        </p>
      )}
    </div>
  );
}
