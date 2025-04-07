// components/login-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle authentication here
    onLogin();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Welcome to CrowdVibe
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Join our community to collaborate on game development
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="dark:text-gray-300">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Login
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                  onClick={() => setActiveTab("register")}
                >
                  Sign up
                </button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="dark:text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-password"
                  className="dark:text-gray-300"
                >
                  Password
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-confirm"
                  className="dark:text-gray-300"
                >
                  Confirm Password
                </Label>
                <Input
                  id="register-confirm"
                  type="password"
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    terms and conditions
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Create Account
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                  onClick={() => setActiveTab("login")}
                >
                  Log in
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
