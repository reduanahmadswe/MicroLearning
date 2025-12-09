"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setIsVerifying(false);
        setIsSuccess(false);
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await api.post("/auth/verify-email", { token });
        setIsSuccess(true);
        setMessage(response.data.message || "Email verified successfully!");
        toast.success("Email verified! You can now login.");
      } catch (error: any) {
        setIsSuccess(false);
        setMessage(error.response?.data?.message || "Verification failed");
        toast.error("Email verification failed");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    try {
      await api.post("/auth/resend-verification");
      toast.success("Verification email sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend email");
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-gradient p-4">
        <Card className="w-full max-w-md bg-card border-border/50">
          <CardHeader className="space-y-1 text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-4" />
            <CardTitle className="text-2xl font-bold text-foreground">Verifying Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">Please wait while we verify your email address...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-gradient p-4">
      <Card className="w-full max-w-md bg-card border-border/50">
        <CardHeader className="space-y-1 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-red-100 dark:bg-red-900/30"
            }`}>
            {isSuccess ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isSuccess ? "Email Verified!" : "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">{message}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-2">
          {isSuccess ? (
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Go to Login</Button>
            </Link>
          ) : (
            <>
              <Button onClick={handleResendEmail} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Resend Verification Email
              </Button>
              <Link href="/auth/register" className="w-full">
                <Button variant="outline" className="w-full border-border/50 hover:bg-muted">
                  Back to Register
                </Button>
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
