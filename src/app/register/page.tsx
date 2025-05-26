
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { Loader2, UserPlus } from "lucide-react";
import { Logo } from "@/components/icons/logo";


const registerFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path to field that gets the error
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, error: authError, isLoading: authIsLoading } = useAuthStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    const success = await register({ username: data.username, password: data.password });
    setIsSubmitting(false);
    if (success) {
      toast({
        title: "Registration Successful",
        description: "You can now log in with your new account.",
      });
      router.push("/login");
    } else {
      form.setError("username", { type: "manual", message: authError || "Registration failed. Please try again." });
      toast({
        title: "Registration Failed",
        description: authError || "Could not create account.",
        variant: "destructive",
      });
    }
  };
  
  React.useEffect(() => {
    if (authError && !isSubmitting) {
       form.setError("username", {type: "manual", message: authError});
    }
  }, [authError, form, isSubmitting]);


  return (
    <div className="w-full max-w-md">
      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join Student Hub to manage student records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || authIsLoading}>
                {isSubmitting || authIsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isSubmitting || authIsLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-xs text-center text-muted-foreground px-4">
            REMINDER: This is a MOCK registration system for demonstration. Passwords are not stored securely.
          </p>
        </CardFooter>
      </Card>
       <div className="mt-6 text-center">
          <Image 
            src="https://placehold.co/600x400.png"
            alt="Student Hub Registration"
            width={300}
            height={200}
            className="mx-auto rounded-lg shadow-md"
            data-ai-hint="students collaborating"
          />
        </div>
    </div>
  );
}
