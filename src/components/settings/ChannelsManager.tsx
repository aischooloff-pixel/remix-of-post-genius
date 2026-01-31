import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

export function ChannelsManager() {
  const { bots, channels, addChannel, removeChannel } = useSettings();
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelUsername, setChannelUsername] = useState("");
  const [selectedBotId, setSelectedBotId] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const activeBots = bots.filter((b) => b.isActive);

  const handleAddChannel = async () => {
    if (!channelUsername.trim() || !selectedBotId) {
      toast.error("Заполните все поля");
      return;
    }

    const selectedBot = bots.find((b) => b.id === selectedBotId);
    if (!selectedBot) {
      toast.error("Бот не найден");
      return;
    }

    setIsValidating(true);
    
    // Simulate channel validation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const formattedUsername = channelUsername.startsWith("@") 
      ? channelUsername 
      : `@${channelUsername}`;

    addChannel({
      id: Date.now().toString(),
      channelId: "-100" + Date.now(),
      channelTitle: channelUsername.replace("@", ""),
      channelUsername: formattedUsername,
      botId: selectedBotId,
      botName: selectedBot.botName,
      isActive: true,
      createdAt: new Date(),
    });

    setChannelUsername("");
    setSelectedBotId("");
    setIsAddingChannel(false);
    setIsValidating(false);
    toast.success("Канал успешно добавлен!");
  };

  const handleDeleteChannel = (id: string) => {
    removeChannel(id);
    toast.success("Канал удалён");
  };

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
                Укажите username канала и выберите бота для публикации
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Username канала</Label>
                <Input
                  id="channel"
                  placeholder="@my_channel"
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
                  Бот должен быть администратором канала
                </p>
              </div>
              <Button
                onClick={handleAddChannel}
                disabled={isValidating || activeBots.length === 0}
                className="w-full"
              >
                {isValidating ? "Проверка прав..." : "Добавить канал"}
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
                      <CardTitle className="text-lg">{channel.channelTitle}</CardTitle>
                      <CardDescription>{channel.channelUsername}</CardDescription>
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
                    <span>Бот: {channel.botName}</span>
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
