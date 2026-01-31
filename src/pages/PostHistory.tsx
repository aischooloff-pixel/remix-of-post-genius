import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePosts } from "@/contexts/PostsContext";
import { useBots } from "@/hooks/useBots";
import { useChannels } from "@/hooks/useChannels";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Clock, Send, AlertCircle, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostStatus, TONE_LABELS, ToneOption } from "@/types/post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_CONFIG: Record<PostStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  draft: { label: "Черновик", variant: "secondary", icon: <FileText className="h-3 w-3" /> },
  scheduled: { label: "Запланирован", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  sending: { label: "Отправка...", variant: "default", icon: <Send className="h-3 w-3" /> },
  sent: { label: "Отправлен", variant: "default", icon: <Send className="h-3 w-3" /> },
  failed: { label: "Ошибка", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  cancelled: { label: "Отменён", variant: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
};

type FilterType = "all" | "draft" | "scheduled" | "sent";

export default function PostHistory() {
  const { posts, loading, deletePost } = usePosts();
  const { getBotToken } = useBots();
  const { channels } = useChannels();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");

  const handleDelete = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    let botToken: string | undefined;
    
    // If post was sent, find the bot token to delete from Telegram
    if (post?.status === "sent" && post.channelId) {
      const channel = channels.find(c => c.id === post.channelId);
      if (channel?.botTokenId) {
        botToken = getBotToken(channel.botTokenId) || undefined;
      }
    }
    
    await deletePost(postId, botToken);
  };

  const handleEdit = (postId: string) => {
    navigate(`/?edit=${postId}`);
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    if (filter === "draft") return post.status === "draft";
    if (filter === "scheduled") return post.status === "scheduled";
    if (filter === "sent") return post.status === "sent";
    return true;
  });

  const counts = {
    all: posts.length,
    draft: posts.filter(p => p.status === "draft").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
    sent: posts.filter(p => p.status === "sent").length,
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Посты</h1>
            <p className="text-muted-foreground">
              Все созданные посты ({posts.length})
            </p>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">
              Все {counts.all > 0 && <Badge variant="secondary" className="ml-2">{counts.all}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="draft">
              Черновики {counts.draft > 0 && <Badge variant="secondary" className="ml-2">{counts.draft}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Запланированные {counts.scheduled > 0 && <Badge variant="secondary" className="ml-2">{counts.scheduled}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sent">
              Отправленные {counts.sent > 0 && <Badge variant="secondary" className="ml-2">{counts.sent}</Badge>}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="border rounded-lg">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{filter === "all" ? "Постов пока нет" : "Нет постов с таким статусом"}</p>
                <p className="text-sm">Создайте первый пост на главной странице</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Идея</TableHead>
                    <TableHead>Тон</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead>Запланирован</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => {
                    const statusConfig = STATUS_CONFIG[post.status];
                    const canEdit = post.status === "draft";
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <span title={post.ideaText}>
                            {truncateText(post.ideaText)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {post.tone ? (
                            <Badge variant="outline">
                              {TONE_LABELS[post.tone as ToneOption]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(post.createdAt, "d MMM, HH:mm", { locale: ru })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {post.scheduleDatetime ? (
                            format(post.scheduleDatetime, "d MMM, HH:mm", { locale: ru })
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(post.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Удалить пост?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это действие нельзя отменить. Пост будет удалён навсегда.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(post.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </div>
      </div>
    </MainLayout>
  );
}
