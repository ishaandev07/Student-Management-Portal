
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
import { Loader2, LogIn } from "lucide-react";
import { Logo } from "@/components/icons/logo";

const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError, isLoading: authIsLoading } = useAuthStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const success = await login(data);
    setIsSubmitting(false);
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/"); // Redirect to dashboard or home
    } else {
      // Auth error is already set in the store, form will display it
      form.setError("username", { type: "manual", message: authError || "Login failed. Please try again." });
      form.setError("password", { type: "manual", message: "" }); // Clear password field or keep it based on UX preference
       toast({
        title: "Login Failed",
        description: authError || "Invalid username or password.",
        variant: "destructive",
      });
    }
  };
  
  React.useEffect(() => {
    if (authError && !isSubmitting) { // Display general auth errors if not tied to a submission
      form.setError("username", {type: "manual", message: authError});
    }
  }, [authError, form, isSubmitting]);

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your Student Hub.</CardDescription>
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
                      <Input placeholder="Enter your username" {...field} />
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
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || authIsLoading}>
                {isSubmitting || authIsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isSubmitting || authIsLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
           <p className="mt-4 text-xs text-center text-muted-foreground px-4">
            Note: This is a demo. Use any username/password for initial registration, then use those credentials to log in.
          </p>
        </CardFooter>
      </Card>
       <div className="mt-6 text-center">
          <Image 
            src="https://placehold.co/600x400.png"
            alt="Student Hub Login"
            width={300}
            height={200}
            className="mx-auto rounded-lg shadow-md"
            data-ai-hint="education learning"
          />
        </div>
    </div>
  );
}
