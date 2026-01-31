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
import { MessageSquare, Bot, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBots } from "@/hooks/useBots";
import { useChannels } from "@/hooks/useChannels";

interface SelectedChannel {
  id: string;
  channelId: string;
  channelTitle: string;
  botToken: string;
  botTokenId: string;
}

interface ChannelSelectorProps {
  selectedChannel: SelectedChannel | null;
  onSelect: (channel: SelectedChannel | null) => void;
}

export function ChannelSelector({ selectedChannel, onSelect }: ChannelSelectorProps) {
  const { bots, loading: botsLoading } = useBots();
  const { channels, loading: channelsLoading } = useChannels();

  const loading = botsLoading || channelsLoading;

  const handleSelectChannel = (channelId: string) => {
    if (channelId === "none") {
      onSelect(null);
      return;
    }

    const channel = channels.find((c) => c.id === channelId);
    if (channel && channel.botTokenId) {
      const bot = bots.find((b) => b.id === channel.botTokenId);
      if (bot) {
        onSelect({
          id: channel.id,
          channelId: channel.channelId,
          channelTitle: channel.channelTitle || channel.channelUsername || channel.channelId,
          botToken: bot.token,
          botTokenId: bot.id,
        });
      }
    }
  };

  const getBotName = (botTokenId: string | null) => {
    if (!botTokenId) return "";
    const bot = bots.find((b) => b.id === botTokenId);
    return bot?.botName || "";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Канал для публикации
        </Label>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        Канал для публикации
      </Label>

      {channels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Bot className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center mb-3">
              Нет добавленных каналов
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                Добавить в настройках
              </Link>
            </Button>
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
            {channels.filter(c => c.isActive).map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{channel.channelTitle || channel.channelUsername}</span>
                  <span className="text-muted-foreground text-xs">
                    ({getBotName(channel.botTokenId)})
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
