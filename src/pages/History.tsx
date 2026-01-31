import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PostHistoryList } from "@/components/history/PostHistoryList";
import { PostHistoryFilters } from "@/components/history/PostHistoryFilters";
import { PostStatus } from "@/types/post";

export default function History() {
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">История постов</h1>
          <p className="text-muted-foreground">
            Просмотр, редактирование и управление опубликованными и запланированными постами
          </p>
        </div>

        <PostHistoryFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <PostHistoryList
          statusFilter={statusFilter}
          searchQuery={searchQuery}
        />
      </div>
    </MainLayout>
  );
}
