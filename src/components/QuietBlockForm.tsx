"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/database.types";

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
    isRecurring: z.boolean(),
    recurrencePattern: z.string().optional(),
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

interface QuietBlockFormProps {
  onSuccess: () => void;
}

export function QuietBlockForm({ onSuccess }: QuietBlockFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      isRecurring: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to create a quiet block");
      return;
    }

    setIsLoading(true);

    // Validate that the selected date/time is in the future
    const selectedDateTime = new Date(data.date);
    const [hours, minutes] = data.startTime.split(":").map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    if (selectedDateTime <= new Date()) {
      toast.error("Please select a future date and time");
      setIsLoading(false);
      return;
    }

    try {
      // Insert the quiet block
      const insertData: Database["public"]["Tables"]["quiet_blocks"]["Insert"] =
        {
          user_id: user.id,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          date: format(data.date, "yyyy-MM-dd"),
          start_time: data.startTime,
          end_time: data.endTime,
          is_recurring: data.isRecurring || false,
          recurrence_pattern: data.recurrencePattern?.trim() || null,
        };

      const { data: quietBlock, error: insertError } = await supabase
        .from("quiet_blocks")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error("Insert error details:", insertError);
        toast.error(
          `Failed to create quiet block: ${insertError.message || "Unknown error"}`,
        );
        return;
      }

      // Calculate notification time (10 minutes before start)
      const [hours, minutes] = data.startTime.split(":").map(Number);
      const notificationDate = new Date(data.date);
      notificationDate.setHours(hours, minutes - 10, 0, 0);

      // Check if notification time is in the past
      const now = new Date();
      if (notificationDate < now) {
        toast.success(
          "Quiet block created successfully! (No notification - time is in the past)",
        );
        form.reset();
        onSuccess();
        return;
      }

      // Insert email notification
      const { error: notificationError } = await supabase
        .from("email_notifications")
        .insert({
          quiet_block_id: quietBlock.id,
          user_id: user.id,
          scheduled_time: notificationDate.toISOString(),
        });

      if (notificationError) {
        // Don't throw here as the quiet block was created successfully
        toast.error(
          `Notification setup failed: ${notificationError.message || "Unknown error"}`,
        );
      } else {
        toast.success("Quiet block created successfully!");
      }

      form.reset();
      onSuccess();
    } catch {
      toast.error("Failed to create quiet block");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <FormDescription>
                Give your quiet block a descriptive name
              </FormDescription>
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
              <FormDescription>
                Add details about what you&apos;ll be studying
              </FormDescription>
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
              <FormDescription>
                Select when your quiet block will occur
              </FormDescription>
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
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Quiet Block"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
