import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Plus, Trash2, Edit, Star, Loader2, Eye, EyeOff } from "lucide-react";
import { useAIProviders, AIProvider } from "@/hooks/useAIProviders";

const PRESET_PROVIDERS = [
  {
    id: "openrouter",
    name: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)" },
      { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)" },
      { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    endpoint: "https://api.anthropic.com/v1/messages",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    ],
  },
  {
    id: "custom",
    name: "Другой (Custom)",
    endpoint: "",
    models: [],
  },
];

export function AIProvidersManager() {
  const { providers, loading, addProvider, updateProvider, deleteProvider, setDefaultProvider } = useAIProviders();
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formProviderType, setFormProviderType] = useState("openrouter");
  const [formApiKey, setFormApiKey] = useState("");
  const [formEndpoint, setFormEndpoint] = useState(PRESET_PROVIDERS[0].endpoint);
  const [formModelId, setFormModelId] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormProviderType("openrouter");
    setFormApiKey("");
    setFormEndpoint(PRESET_PROVIDERS[0].endpoint);
    setFormModelId("");
  };

  const handleProviderTypeChange = (type: string) => {
    setFormProviderType(type);
    const preset = PRESET_PROVIDERS.find((p) => p.id === type);
    if (preset) {
      setFormEndpoint(preset.endpoint);
      if (preset.models.length > 0) {
        setFormModelId(preset.models[0].id);
      }
    }
  };

  const handleAddProvider = async () => {
    if (!formName.trim() || !formApiKey.trim() || !formEndpoint.trim() || !formModelId.trim()) {
      return;
    }

    setIsSaving(true);
    const result = await addProvider(
      formName.trim(),
      formProviderType,
      formApiKey.trim(),
      formEndpoint.trim(),
      formModelId.trim()
    );
    setIsSaving(false);

    if (result) {
      resetForm();
      setIsAddingProvider(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider) return;

    setIsSaving(true);
    const success = await updateProvider(editingProvider.id, {
      name: formName.trim(),
      providerType: formProviderType,
      apiKey: formApiKey.trim(),
      endpointUrl: formEndpoint.trim(),
      modelId: formModelId.trim(),
    });
    setIsSaving(false);

    if (success) {
      setEditingProvider(null);
      resetForm();
    }
  };

  const handleEdit = (provider: AIProvider) => {
    setFormName(provider.name);
    setFormProviderType(provider.providerType);
    setFormApiKey(provider.apiKey);
    setFormEndpoint(provider.endpointUrl);
    setFormModelId(provider.modelId);
    setEditingProvider(provider);
  };

  const handleDelete = async (id: string) => {
    await deleteProvider(id);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultProvider(id);
  };

  const selectedPreset = PRESET_PROVIDERS.find((p) => p.id === formProviderType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ProviderFormContent = ({ onSave, buttonText }: { onSave: () => void; buttonText: string }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input
          placeholder="Мой OpenRouter"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Провайдер</Label>
        <Select value={formProviderType} onValueChange={handleProviderTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESET_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>API Ключ</Label>
        <Input
          type="password"
          placeholder="sk-..."
          value={formApiKey}
          onChange={(e) => setFormApiKey(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Endpoint URL</Label>
        <Input
          placeholder="https://..."
          value={formEndpoint}
          onChange={(e) => setFormEndpoint(e.target.value)}
          disabled={formProviderType !== "custom"}
        />
      </div>

      <div className="space-y-2">
        <Label>Модель</Label>
        {selectedPreset && selectedPreset.models.length > 0 ? (
          <Select value={formModelId} onValueChange={setFormModelId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите модель" />
            </SelectTrigger>
            <SelectContent>
              {selectedPreset.models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="model-name"
            value={formModelId}
            onChange={(e) => setFormModelId(e.target.value)}
          />
        )}
      </div>

      <Button onClick={onSave} className="w-full" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Сохранение...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Провайдеры</h2>
          <p className="text-sm text-muted-foreground">
            Настройте свои API ключи для генерации постов
          </p>
        </div>
        <Dialog open={isAddingProvider} onOpenChange={(open) => {
          setIsAddingProvider(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить провайдера
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый AI провайдер</DialogTitle>
              <DialogDescription>
                Добавьте свой API ключ для генерации постов
              </DialogDescription>
            </DialogHeader>
            <ProviderFormContent onSave={handleAddProvider} buttonText="Добавить" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProvider} onOpenChange={(open) => {
        if (!open) {
          setEditingProvider(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать провайдера</DialogTitle>
          </DialogHeader>
          <ProviderFormContent onSave={handleUpdateProvider} buttonText="Сохранить" />
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {providers.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2">
                Нет настроенных провайдеров
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Добавьте свой API ключ для OpenRouter, OpenAI или другого провайдера
              </p>
            </CardContent>
          </Card>
        ) : (
          providers.map((provider) => (
            <Card key={provider.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {provider.name}
                        {provider.isDefault && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {provider.modelId}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      API: {showApiKey === provider.id ? provider.apiKey : "••••••••••••"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(showApiKey === provider.id ? null : provider.id)}
                    >
                      {showApiKey === provider.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(provider)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!provider.isDefault && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(provider.id)}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(provider.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
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
