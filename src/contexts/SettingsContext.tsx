import { createContext, useContext, useState, ReactNode } from "react";

export interface BotToken {
  id: string;
  botUsername: string;
  botName: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Channel {
  id: string;
  channelId: string;
  channelTitle: string;
  channelUsername: string;
  botId: string;
  botName: string;
  isActive: boolean;
  createdAt: Date;
}

interface SettingsContextType {
  bots: BotToken[];
  setBots: React.Dispatch<React.SetStateAction<BotToken[]>>;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  addBot: (bot: BotToken) => void;
  removeBot: (id: string) => void;
  toggleBot: (id: string) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [bots, setBots] = useState<BotToken[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const addBot = (bot: BotToken) => {
    setBots((prev) => [...prev, bot]);
  };

  const removeBot = (id: string) => {
    setBots((prev) => prev.filter((b) => b.id !== id));
    // Also remove channels associated with this bot
    setChannels((prev) => prev.filter((c) => c.botId !== id));
  };

  const toggleBot = (id: string) => {
    setBots((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const addChannel = (channel: Channel) => {
    setChannels((prev) => [...prev, channel]);
  };

  const removeChannel = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <SettingsContext.Provider
      value={{
        bots,
        setBots,
        channels,
        setChannels,
        addBot,
        removeBot,
        toggleBot,
        addChannel,
        removeChannel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
