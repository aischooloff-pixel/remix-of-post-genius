import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BotTokensManager } from "@/components/settings/BotTokensManager";
import { ChannelsManager } from "@/components/settings/ChannelsManager";
import { SystemPromptsManager } from "@/components/settings/SystemPromptsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageSquare, FileText } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("bots");

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-muted-foreground">
            Управление ботами, каналами и системными промптами
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="bots" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Боты
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Каналы
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Промпты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots">
            <BotTokensManager />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelsManager />
          </TabsContent>

          <TabsContent value="prompts">
            <SystemPromptsManager />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
