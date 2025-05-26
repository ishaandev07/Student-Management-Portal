"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { StudentFormData, CourseEntry } from "@/types/student";

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  grade: z.string().min(1, "Grade is required"),
  credits: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Credits must be a non-negative number",
  }),
});

const studentFormSchema = z.object({
  studentIdExt: z.string().min(1, "Student ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  enrollmentDate: z.date({ required_error: "Enrollment date is required." }),
  profilePictureUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  courses: z.array(courseSchema).min(0),
  academicNotes: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  initialData?: StudentFormData;
  onSubmit: (data: StudentFormValues) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function StudentForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Save Student",
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData || {
      studentIdExt: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      enrollmentDate: new Date(),
      profilePictureUrl: "",
      courses: [],
      academicNotes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "courses",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentIdExt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., S1001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="e.g., (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="enrollmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Enrollment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
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
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profilePictureUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormDescription>Enter a URL for the student's profile picture.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Courses</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start p-4 border rounded-md">
              <FormField
                control={form.control}
                name={`courses.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Calculus I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`courses.${index}.grade`}
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/4">
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`courses.${index}.credits`}
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/4">
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6 text-destructive hover:text-destructive"
                onClick={() => remove(index)}
                aria-label="Remove course"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: "", grade: "", credits: "" })}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>

        <FormField
          control={form.control}
          name="academicNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any relevant academic notes or comments..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
