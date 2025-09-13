"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/database.types";

type QuietBlock = Database["public"]["Tables"]["quiet_blocks"]["Row"];

const formSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    date: z
      .date()
      .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: "Please select a date",
      }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      return endTotalMinutes > startTotalMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

type FormData = z.infer<typeof formSchema>;

interface EditQuietBlockDialogProps {
  quietBlock: QuietBlock | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditQuietBlockDialog({
  quietBlock,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditQuietBlockDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  // Update form values when quietBlock changes
  useEffect(() => {
    if (quietBlock) {
      form.reset({
        title: quietBlock.title,
        description: quietBlock.description || "",
        date: parseISO(quietBlock.date),
        startTime: quietBlock.start_time,
        endTime: quietBlock.end_time,
      });
    }
  }, [quietBlock, form]);

  const onSubmit = async (data: FormData) => {
    if (!quietBlock) return;

    setIsLoading(true);

    try {
      // Update the quiet block
      const { error: updateError } = await supabase
        .from("quiet_blocks")
        .update({
          title: data.title,
          description: data.description || null,
          date: format(data.date, "yyyy-MM-dd"),
          start_time: data.startTime,
          end_time: data.endTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quietBlock.id);

      if (updateError) throw updateError;

      // Update the corresponding email notification
      const [hours, minutes] = data.startTime.split(":").map(Number);
      const notificationDate = new Date(data.date);
      notificationDate.setHours(hours, minutes - 10, 0, 0);

      const { error: notificationError } = await supabase
        .from("email_notifications")
        .update({
          scheduled_time: notificationDate.toISOString(),
          status: "pending", // Reset status in case it was already sent
          updated_at: new Date().toISOString(),
        })
        .eq("quiet_block_id", quietBlock.id);

      if (notificationError) {
        toast.error("Quiet block updated but notification update failed");
      } else {
        toast.success("Quiet block updated successfully!");
      }

      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to update quiet block");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Quiet Block</DialogTitle>
          <DialogDescription>
            Update your study session details and timing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Focus Study Session" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mathematics review, reading chapter 5, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Quiet Block"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
