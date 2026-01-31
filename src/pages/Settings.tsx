import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BotTokensManager } from "@/components/settings/BotTokensManager";
import { ChannelsManager } from "@/components/settings/ChannelsManager";
import { SystemPromptsManager } from "@/components/settings/SystemPromptsManager";
import { AIProvidersManager } from "@/components/settings/AIProvidersManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageSquare, FileText, Brain } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("bots");

  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Управление ботами, каналами, AI и промптами
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6 md:mb-8">
            <TabsTrigger value="bots" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Боты</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Каналы</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Промпты</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots">
            <BotTokensManager />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelsManager />
          </TabsContent>

          <TabsContent value="ai">
            <AIProvidersManager />
          </TabsContent>

          <TabsContent value="prompts">
            <SystemPromptsManager />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
