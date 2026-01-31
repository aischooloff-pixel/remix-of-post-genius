import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Send, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface ScheduleWidgetProps {
  onPublishNow: () => void;
  onSchedule: (datetime: Date) => void;
  isPublishing?: boolean;
}

export function ScheduleWidget({
  onPublishNow,
  onSchedule,
  isPublishing,
}: ScheduleWidgetProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("12:00");

  const handleSchedule = () => {
    if (!date) return;
    
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // Show info toast about how scheduling works
    toast.info(
      "Telegram не позволяет ботам делать отложенную отправку. Пост будет отправлен автоматически нашим сервером в указанное время.",
      {
        duration: 5000,
      }
    );
    
    onSchedule(scheduledDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
          onClick={onPublishNow}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Публикация...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Опубликовать сейчас
            </>
          )}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">или запланировать</span>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
        <div className="grid grid-cols-2 gap-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              Дата
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? (
                    format(date, "d MMMM yyyy", { locale: ru })
                  ) : (
                    "Выберите дату"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Время
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>


        <Button
          variant="outline"
          className="w-full"
          onClick={handleSchedule}
          disabled={!date || isPublishing}
        >
          <Timer className="w-4 h-4 mr-2" />
          Запланировать
        </Button>
      </div>
    </div>
  );
}