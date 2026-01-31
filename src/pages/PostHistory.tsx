import { MainLayout } from "@/components/layout/MainLayout";
import { usePosts } from "@/contexts/PostsContext";
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
import { Trash2, Eye, Clock, Send, AlertCircle, FileText } from "lucide-react";
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

const STATUS_CONFIG: Record<PostStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  draft: { label: "Черновик", variant: "secondary", icon: <FileText className="h-3 w-3" /> },
  scheduled: { label: "Запланирован", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  sending: { label: "Отправка...", variant: "default", icon: <Send className="h-3 w-3" /> },
  sent: { label: "Отправлен", variant: "default", icon: <Send className="h-3 w-3" /> },
  failed: { label: "Ошибка", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  cancelled: { label: "Отменён", variant: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
};

export default function PostHistory() {
  const { posts, loading, deletePost } = usePosts();

  const handleDelete = async (id: string) => {
    await deletePost(id);
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">История постов</h1>
            <p className="text-muted-foreground">
              Все созданные посты ({posts.length})
            </p>
          </div>
        </div>

        <div className="border rounded-lg">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Постов пока нет</p>
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
                  {posts.map((post) => {
                    const statusConfig = STATUS_CONFIG[post.status];
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
