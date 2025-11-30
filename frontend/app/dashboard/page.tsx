"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted-foreground">Ready to continue learning?</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 XP Points</CardTitle>
            <CardDescription>Your total experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{user?.xp || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⭐ Level</CardTitle>
            <CardDescription>Current level</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{user?.level || 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔥 Streak</CardTitle>
            <CardDescription>Days in a row</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{user?.streak || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📊 Recent Activity</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your learning activity will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}
