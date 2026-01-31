import { useState } from "react";
import { Plus, Trash2, GripVertical, Link as LinkIcon, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineButton } from "@/types/post";

interface ButtonsBuilderProps {
  buttons: InlineButton[];
  onChange: (buttons: InlineButton[]) => void;
}

export function ButtonsBuilder({ buttons, onChange }: ButtonsBuilderProps) {
  const addButton = () => {
    const newButton: InlineButton = {
      id: `btn_${Date.now()}`,
      text: "Кнопка",
      type: "url",
      payload: "",
      row: buttons.length > 0 ? Math.max(...buttons.map((b) => b.row)) : 0,
    };
    onChange([...buttons, newButton]);
  };

  const updateButton = (id: string, updates: Partial<InlineButton>) => {
    onChange(
      buttons.map((btn) => (btn.id === id ? { ...btn, ...updates } : btn))
    );
  };

  const removeButton = (id: string) => {
    onChange(buttons.filter((btn) => btn.id !== id));
  };

  const addRow = () => {
    const newRow = buttons.length > 0 ? Math.max(...buttons.map((b) => b.row)) + 1 : 0;
    const newButton: InlineButton = {
      id: `btn_${Date.now()}`,
      text: "Кнопка",
      type: "url",
      payload: "",
      row: newRow,
    };
    onChange([...buttons, newButton]);
  };

  // Group buttons by row
  const buttonsByRow = buttons.reduce((acc, btn) => {
    if (!acc[btn.row]) acc[btn.row] = [];
    acc[btn.row].push(btn);
    return acc;
  }, {} as Record<number, InlineButton[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Инлайн-кнопки</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addButton}>
            <Plus className="w-4 h-4 mr-1" />
            Кнопка
          </Button>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="w-4 h-4 mr-1" />
            Ряд
          </Button>
        </div>
      </div>

      {buttons.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            Нет кнопок. Добавьте кнопку или ряд.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(buttonsByRow)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([row, rowButtons]) => (
              <div key={row} className="space-y-2">
                <div className="text-xs text-muted-foreground">Ряд {Number(row) + 1}</div>
                <div className="space-y-2">
                  {rowButtons.map((btn) => (
                    <div
                      key={btn.id}
                      className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                        
                        <Input
                          value={btn.text}
                          onChange={(e) =>
                            updateButton(btn.id, { text: e.target.value })
                          }
                          placeholder="Текст кнопки"
                          className="flex-1 h-8"
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0 sm:hidden"
                          onClick={() => removeButton(btn.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select
                          value={btn.type}
                          onValueChange={(value: "url" | "callback") =>
                            updateButton(btn.id, { type: value })
                          }
                        >
                          <SelectTrigger className="w-24 h-8 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="url">
                              <div className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                URL
                              </div>
                            </SelectItem>
                            <SelectItem value="callback">
                              <div className="flex items-center gap-1">
                                <MousePointer className="w-3 h-3" />
                                Callback
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          value={btn.payload}
                          onChange={(e) =>
                            updateButton(btn.id, { payload: e.target.value })
                          }
                          placeholder={btn.type === "url" ? "https://..." : "callback_data"}
                          className="flex-1 h-8 min-w-0"
                        />

                        <Select
                          value={String(btn.row)}
                          onValueChange={(value) =>
                            updateButton(btn.id, { row: Number(value) })
                          }
                        >
                          <SelectTrigger className="w-20 h-8 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...new Set(buttons.map((b) => b.row)), Math.max(...buttons.map((b) => b.row)) + 1]
                              .sort((a, b) => a - b)
                              .map((r) => (
                                <SelectItem key={r} value={String(r)}>
                                  Ряд {r + 1}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0 hidden sm:flex"
                          onClick={() => removeButton(btn.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {buttons.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Максимум 8 кнопок в ряду, до 100 кнопок всего
        </p>
      )}
    </div>
  );
}