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
import { Send, ChevronUp, Code, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { Message, Proposal, Room } from "@/types/api";

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newProposal, setNewProposal] = useState<{
    title: string;
    description: string;
    type: "code" | "feature";
  }>({ title: "", description: "", type: "feature" });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsData = await api.getRooms();
        setRooms(roomsData);
        if (roomsData.length > 0) {
          setCurrentRoom(roomsData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch messages and proposals when room changes
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!currentRoom) return;
      try {
        const [messagesData, proposalsData] = await Promise.all([
          api.getMessages(currentRoom.id),
          api.getProposals(currentRoom.id),
        ]);
        setMessages(messagesData);
        setProposals(proposalsData);
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };
    fetchRoomData();
  }, [currentRoom]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom) return;

    try {
      const message = await api.sendMessage({
        roomId: currentRoom.id,
        userId: "current-user", // TODO: Replace with actual user ID
        content: newMessage,
      });
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProposal.title.trim() || !currentRoom) return;

    try {
      const proposal = await api.createProposal({
        roomId: currentRoom.id,
        userId: "current-user", // TODO: Replace with actual user ID
        ...newProposal,
      });
      setProposals((prev) => [...prev, proposal]);
      setNewProposal({ title: "", description: "", type: "feature" });
    } catch (error) {
      console.error("Failed to create proposal:", error);
    }
  };

  const handleVote = async (proposalId: string) => {
    try {
      await api.vote({
        proposalId,
        userId: "current-user", // TODO: Replace with actual user ID
      });
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, votes: p.votes + 1 } : p
        )
      );
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col gap-4 h-full overflow-hidden">
      {/* Suggestions List */}
      <Card className="flex-shrink-0 dark:border-gray-800">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-lg dark:text-white">
            Top Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[180px] overflow-y-auto px-3 py-2">
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center p-0 h-auto"
                  onClick={() => handleVote(proposal.id)}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-xs font-bold">{proposal.votes}</span>
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      @user{proposal.userId}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(proposal.createdAt).toLocaleTimeString()}
                    </span>
                    {proposal.type === "code" ? (
                      <Code className="h-3 w-3 text-purple-500" />
                    ) : (
                      <MessageSquare className="h-3 w-3 text-pink-500" />
                    )}
                  </div>
                  <p className="text-sm line-clamp-2 dark:text-gray-200">
                    {proposal.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestion Form */}
      <Card className="flex-shrink-0 dark:border-gray-800">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-lg dark:text-white">
            Submit Your Idea
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 py-2">
          <form onSubmit={handleCreateProposal} className="space-y-3">
            <Input
              placeholder="Title"
              value={newProposal.title}
              onChange={(e) =>
                setNewProposal((prev) => ({ ...prev, title: e.target.value }))
              }
              className="dark:bg-gray-800 dark:border-gray-700"
            />
            <Input
              placeholder="Description"
              value={newProposal.description}
              onChange={(e) =>
                setNewProposal((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="dark:bg-gray-800 dark:border-gray-700"
            />

            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    newProposal.type === "code"
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }`}
                  onClick={() =>
                    setNewProposal((prev) => ({ ...prev, type: "code" }))
                  }
                >
                  <Code className="h-4 w-4 text-purple-500" />
                  <span className="text-sm dark:text-gray-300">Code</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    newProposal.type === "feature"
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }`}
                  onClick={() =>
                    setNewProposal((prev) => ({ ...prev, type: "feature" }))
                  }
                >
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                  <span className="text-sm dark:text-gray-300">Feature</span>
                </Button>
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="sm"
                disabled={!newProposal.title.trim()}
              >
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex-1 flex flex-col h-full dark:border-gray-800">
        <CardHeader className="pb-3 px-3 flex-shrink-0">
          <CardTitle className="text-lg dark:text-white">
            Community Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-3 min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === "current-user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.userId === "current-user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.userId === "current-user"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-gray-500 ${
                        message.userId === "current-user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span className="font-medium mr-1">
                        {message.userId === "current-user" ? "You" : "User"}
                      </span>
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-3 border-t dark:border-gray-800 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 dark:bg-gray-800 dark:border-gray-700"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
