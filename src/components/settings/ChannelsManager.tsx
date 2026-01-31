import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useBots } from "@/hooks/useBots";
import { useChannels } from "@/hooks/useChannels";

export function ChannelsManager() {
  const { bots } = useBots();
  const { channels, loading, addChannel, removeChannel } = useChannels();
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelUsername, setChannelUsername] = useState("");
  const [selectedBotId, setSelectedBotId] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const activeBots = bots.filter((b) => b.isActive);

  const handleAddChannel = async () => {
    if (!channelUsername.trim() || !selectedBotId) {
      return;
    }

    const selectedBot = bots.find((b) => b.id === selectedBotId);
    if (!selectedBot) {
      return;
    }

    setIsValidating(true);
    
    const formattedUsername = channelUsername.startsWith("@") 
      ? channelUsername 
      : channelUsername.startsWith("-")
        ? channelUsername
        : `@${channelUsername}`;

    const result = await addChannel(
      selectedBot.encryptedToken,
      selectedBot.id,
      formattedUsername
    );
    
    setIsValidating(false);

    if (result) {
      setChannelUsername("");
      setSelectedBotId("");
      setIsAddingChannel(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    await removeChannel(id);
  };

  const getBotName = (botTokenId: string | null) => {
    if (!botTokenId) return "Неизвестный бот";
    const bot = bots.find((b) => b.id === botTokenId);
    return bot?.botName || "Неизвестный бот";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Telegram каналы</h2>
          <p className="text-sm text-muted-foreground">
            Каналы, в которые будут публиковаться посты
          </p>
        </div>
        <Dialog open={isAddingChannel} onOpenChange={setIsAddingChannel}>
          <DialogTrigger asChild>
            <Button disabled={activeBots.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить канал
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить канал</DialogTitle>
              <DialogDescription>
                Укажите username или ID канала и выберите бота для публикации
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Username или ID канала</Label>
                <Input
                  id="channel"
                  placeholder="@my_channel или -1001234567890"
                  value={channelUsername}
                  onChange={(e) => setChannelUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Бот для публикации</Label>
                <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите бота" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        {bot.botName} ({bot.botUsername})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeBots.length === 0 && (
                  <p className="text-xs text-destructive">
                    Сначала добавьте бота во вкладке "Боты"
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Бот должен быть администратором канала с правами публикации
                </p>
              </div>
              <Button
                onClick={handleAddChannel}
                disabled={isValidating || activeBots.length === 0 || !channelUsername.trim() || !selectedBotId}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Проверка прав...
                  </>
                ) : (
                  "Добавить канал"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeBots.length === 0 && (
        <Card className="glass-card border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-400">
              ⚠️ Для добавления каналов сначала добавьте бота во вкладке "Боты"
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {channels.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Нет добавленных каналов
              </p>
              {activeBots.length > 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsAddingChannel(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первый канал
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          channels.map((channel) => (
            <Card key={channel.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{channel.channelTitle || "Канал"}</CardTitle>
                      <CardDescription>{channel.channelUsername || channel.channelId}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {channel.isActive ? (
                      <span className="flex items-center gap-1 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Активен
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        Неактивен
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span>Бот: {getBotName(channel.botTokenId)}</span>
                    <span className="mx-2">•</span>
                    <span>ID: {channel.channelId}</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteChannel(channel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
