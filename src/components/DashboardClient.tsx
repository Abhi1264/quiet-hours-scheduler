"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Plus, Settings, Calendar } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { toast } from "sonner";
import { Database } from "@/lib/database.types";
import { QuietBlockForm } from "@/components/QuietBlockForm";
import { EditQuietBlockDialog } from "@/components/EditQuietBlockDialog";
import { DeleteQuietBlockDialog } from "@/components/DeleteQuietBlockDialog";
import { useAuth } from "@/contexts/AuthContext";

type QuietBlock = Database["public"]["Tables"]["quiet_blocks"]["Row"];

interface DashboardClientProps {
  initialQuietBlocks: QuietBlock[];
}

export function DashboardClient({ initialQuietBlocks }: DashboardClientProps) {
  const [quietBlocks, setQuietBlocks] =
    useState<QuietBlock[]>(initialQuietBlocks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<QuietBlock | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<QuietBlock | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const fetchQuietBlocks = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("quiet_blocks")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        toast.error(
          `Database error: ${error.message || "Failed to load quiet blocks"}`,
        );
        return;
      }

      setQuietBlocks(data || []);
    } catch {
      toast.error(
        "Failed to connect to database. Please check your configuration.",
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };

  return (
    <>
      {/* Action Section */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-neutral-900">
          Your Quiet Blocks
        </h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Quiet Block</DialogTitle>
              <DialogDescription>
                Set up a new study session with email reminders.
              </DialogDescription>
            </DialogHeader>
            <QuietBlockForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                fetchQuietBlocks();
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quiet Blocks List */}
      {quietBlocks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No quiet blocks yet
            </h3>
            <p className="text-neutral-600 mb-4">
              Create your first study session to get started with focused
              learning.
            </p>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Quiet Block</DialogTitle>
                  <DialogDescription>
                    Set up a new study session with email reminders.
                  </DialogDescription>
                </DialogHeader>
                <QuietBlockForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    fetchQuietBlocks();
                    router.refresh();
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quietBlocks.map((block) => (
            <Card key={block.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-neutral-900">
                        {block.title}
                      </h4>
                      {block.is_recurring && (
                        <Badge variant="secondary">Recurring</Badge>
                      )}
                    </div>
                    {block.description && (
                      <p className="text-neutral-600 mb-3">
                        {block.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(block.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(block.start_time)} -{" "}
                        {formatTime(block.end_time)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingBlock(block)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeletingBlock(block)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <EditQuietBlockDialog
        quietBlock={editingBlock}
        isOpen={!!editingBlock}
        onOpenChange={(open) => !open && setEditingBlock(null)}
        onSuccess={() => {
          fetchQuietBlocks();
          router.refresh();
        }}
      />

      {/* Delete Dialog */}
      <DeleteQuietBlockDialog
        quietBlock={deletingBlock}
        isOpen={!!deletingBlock}
        onOpenChange={(open) => !open && setDeletingBlock(null)}
        onSuccess={() => {
          fetchQuietBlocks();
          router.refresh();
        }}
      />
    </>
  );
}
