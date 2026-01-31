import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MoreVertical,
  Edit,
  RefreshCw,
  Trash2,
  Eye,
  Send,
  FileText,
  Loader2
} from "lucide-react";
import { PostStatus } from "@/types/post";
import { usePosts } from "@/hooks/usePosts";
import { useChannels } from "@/hooks/useChannels";

interface PostHistoryListProps {
  statusFilter: PostStatus | "all";
  searchQuery: string;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Черновик", color: "bg-slate-500", icon: <FileText className="w-3 h-3" /> },
  scheduled: { label: "Запланирован", color: "bg-blue-500", icon: <Clock className="w-3 h-3" /> },
  sending: { label: "Отправляется", color: "bg-yellow-500", icon: <Send className="w-3 h-3" /> },
  sent: { label: "Отправлен", color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" /> },
  failed: { label: "Ошибка", color: "bg-red-500", icon: <XCircle className="w-3 h-3" /> },
  cancelled: { label: "Отменён", color: "bg-gray-500", icon: <AlertCircle className="w-3 h-3" /> },
};

export function PostHistoryList({ statusFilter, searchQuery }: PostHistoryListProps) {
  const { posts, loading, updatePost, deletePost } = usePosts();
  const { channels } = useChannels();

  const getChannelTitle = (channelId: string | null) => {
    if (!channelId) return "Не выбран";
    const channel = channels.find((c) => c.id === channelId);
    return channel?.channelTitle || channel?.channelUsername || "Неизвестный канал";
  };

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesSearch = 
      post.ideaText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.editedTextMarkdown || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRetry = async (id: string) => {
    await updatePost(id, { status: "sending", errorMessage: undefined as unknown as string });
    // In a real app, this would trigger the publish-post edge function
    setTimeout(async () => {
      await updatePost(id, { status: "sent", sentAt: new Date() });
    }, 2000);
  };

  const handleCancel = async (id: string) => {
    await updatePost(id, { status: "cancelled" });
  };

  const handleDelete = async (id: string) => {
    await deletePost(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <Card className="glass-card border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {searchQuery || statusFilter !== "all" 
              ? "Нет постов, соответствующих фильтрам" 
              : "История постов пуста"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => {
        const statusConfig = STATUS_CONFIG[post.status];
        const displayText = post.editedTextMarkdown || post.ideaText;
        
        return (
          <Card key={post.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${statusConfig.color} text-white flex items-center gap-1`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getChannelTitle(post.channelId)}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">
                    {post.ideaText}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {displayText}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Просмотр
                    </DropdownMenuItem>
                    {(post.status === "draft" || post.status === "scheduled") && (
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                    )}
                    {post.status === "failed" && (
                      <DropdownMenuItem onClick={() => handleRetry(post.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Повторить
                      </DropdownMenuItem>
                    )}
                    {post.status === "scheduled" && (
                      <DropdownMenuItem onClick={() => handleCancel(post.id)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Отменить
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Создан: {post.createdAt.toLocaleDateString("ru-RU")}</span>
                  {post.scheduleDatetime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Запланирован: {post.scheduleDatetime.toLocaleString("ru-RU")}
                    </span>
                  )}
                  {post.sentAt && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Отправлен: {post.sentAt.toLocaleString("ru-RU")}
                    </span>
                  )}
                </div>
                {post.errorMessage && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {post.errorMessage}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
