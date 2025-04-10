"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { Message } from "@/types/api";
import * as Tabs from "@radix-ui/react-tabs";
import { roomStateService } from "@/lib/room-state-service";

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const subscription = roomStateService.getState().subscribe((state) => {
      setMessages(state.messages);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full md:w-80 h-full flex flex-col">
      <Tabs.Root defaultValue="chat" className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b">
          <Tabs.Trigger
            value="chat"
            className="flex-1 py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            Chat
          </Tabs.Trigger>
          <Tabs.Trigger
            value="proposals"
            className="flex-1 py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            Proposals
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="chat" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-2">
                    <Avatar>
                      <AvatarFallback>
                        {message.first_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {message.first_name}
                      </p>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMessage.trim()) {
                    roomStateService.sendMessage(newMessage);
                    setNewMessage("");
                  }
                }}
                className="flex space-x-2 w-full"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="proposals" className="flex-1">
          {/* Proposals content */}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
