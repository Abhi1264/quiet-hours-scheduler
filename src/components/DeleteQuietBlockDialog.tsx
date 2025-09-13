"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Database } from "@/lib/database.types";

type QuietBlock = Database["public"]["Tables"]["quiet_blocks"]["Row"];

interface DeleteQuietBlockDialogProps {
  quietBlock: QuietBlock | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteQuietBlockDialog({
  quietBlock,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeleteQuietBlockDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleDelete = async () => {
    if (!quietBlock) return;

    setIsLoading(true);

    try {
      // Delete the quiet block (this will cascade delete the email notifications due to foreign key constraint)
      const { error } = await supabase
        .from("quiet_blocks")
        .delete()
        .eq("id", quietBlock.id);

      if (error) throw error;

      toast.success("Quiet block deleted successfully!");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to delete quiet block");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Quiet Block</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{quietBlock?.title}&quot;?
            This action cannot be undone and will also cancel any scheduled
            email notifications.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
