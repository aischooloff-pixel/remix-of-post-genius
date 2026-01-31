import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { PostStatus } from "@/types/post";

interface PostHistoryFiltersProps {
  statusFilter: PostStatus | "all";
  onStatusChange: (status: PostStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const STATUS_LABELS: Record<PostStatus | "all", string> = {
  all: "Все статусы",
  draft: "Черновик",
  scheduled: "Запланирован",
  sending: "Отправляется",
  sent: "Отправлен",
  failed: "Ошибка",
  cancelled: "Отменён",
};

export function PostHistoryFilters({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: PostHistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по тексту поста..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as PostStatus | "all")}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Фильтр по статусу" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
