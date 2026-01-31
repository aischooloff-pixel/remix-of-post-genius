import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Plus, Trash2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface BotToken {
  id: string;
  botUsername: string;
  botName: string;
  isActive: boolean;
  createdAt: Date;
}

export function BotTokensManager() {
  const [bots, setBots] = useState<BotToken[]>([
    {
      id: "1",
      botUsername: "@my_channel_bot",
      botName: "My Channel Bot",
      isActive: true,
      createdAt: new Date(),
    },
  ]);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleAddBot = async () => {
    if (!newToken.trim()) {
      toast.error("Введите токен бота");
      return;
    }

    setIsValidating(true);
    
    // Simulate token validation (in real app, would call Telegram API)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newBot: BotToken = {
      id: Date.now().toString(),
      botUsername: "@new_bot",
      botName: "New Bot",
      isActive: true,
      createdAt: new Date(),
    };

    setBots([...bots, newBot]);
    setNewToken("");
    setIsAddingBot(false);
    setIsValidating(false);
    toast.success("Бот успешно добавлен!");
  };

  const handleDeleteBot = (id: string) => {
    setBots(bots.filter((b) => b.id !== id));
    toast.success("Бот удалён");
  };

  const handleToggleBot = (id: string) => {
    setBots(
      bots.map((b) =>
        b.id === id ? { ...b, isActive: !b.isActive } : b
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Telegram боты</h2>
          <p className="text-sm text-muted-foreground">
            Управление токенами ботов для публикации
          </p>
        </div>
        <Dialog open={isAddingBot} onOpenChange={setIsAddingBot}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить бота
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить Telegram бота</DialogTitle>
              <DialogDescription>
                Введите токен бота, полученный от @BotFather
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="token">Bot Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? "text" : "password"}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Токен будет зашифрован и безопасно сохранён
                </p>
              </div>
              <Button
                onClick={handleAddBot}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? "Проверка токена..." : "Добавить бота"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {bots.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Нет добавленных ботов
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddingBot(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить первого бота
              </Button>
            </CardContent>
          </Card>
        ) : (
          bots.map((bot) => (
            <Card key={bot.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.botName}</CardTitle>
                      <CardDescription>{bot.botUsername}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bot.isActive ? (
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
                  <span className="text-sm text-muted-foreground">
                    Добавлен: {bot.createdAt.toLocaleDateString("ru-RU")}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleBot(bot.id)}
                    >
                      {bot.isActive ? "Деактивировать" : "Активировать"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBot(bot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
