import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Channel {
  id: string;
  channelId: string;
  channelTitle: string;
  channelUsername: string;
  botName: string;
  isActive: boolean;
  createdAt: Date;
}

export function ChannelsManager() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: "1",
      channelId: "-1001234567890",
      channelTitle: "Мой канал",
      channelUsername: "@my_channel",
      botName: "My Channel Bot",
      isActive: true,
      createdAt: new Date(),
    },
  ]);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelUsername, setChannelUsername] = useState("");
  const [selectedBot, setSelectedBot] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const mockBots = [
    { id: "1", name: "My Channel Bot" },
    { id: "2", name: "Another Bot" },
  ];

  const handleAddChannel = async () => {
    if (!channelUsername.trim() || !selectedBot) {
      toast.error("Заполните все поля");
      return;
    }

    setIsValidating(true);
    
    // Simulate channel validation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newChannel: Channel = {
      id: Date.now().toString(),
      channelId: "-100" + Date.now(),
      channelTitle: channelUsername.replace("@", ""),
      channelUsername: channelUsername.startsWith("@") ? channelUsername : `@${channelUsername}`,
      botName: mockBots.find((b) => b.id === selectedBot)?.name || "",
      isActive: true,
      createdAt: new Date(),
    };

    setChannels([...channels, newChannel]);
    setChannelUsername("");
    setSelectedBot("");
    setIsAddingChannel(false);
    setIsValidating(false);
    toast.success("Канал успешно добавлен!");
  };

  const handleDeleteChannel = (id: string) => {
    setChannels(channels.filter((c) => c.id !== id));
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
            <Button>
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
                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите бота" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        {bot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Бот должен быть администратором канала
                </p>
              </div>
              <Button
                onClick={handleAddChannel}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? "Проверка прав..." : "Добавить канал"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {channels.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Нет добавленных каналов
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddingChannel(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый канал
              </Button>
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
