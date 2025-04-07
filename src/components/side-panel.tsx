"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useUser } from "@/contexts/user-context";

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newProposal, setNewProposal] = useState<{
    text: string;
  }>({ text: "" });
  const { userId, isLoading } = useUser();

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
  const fetchRoomData = useCallback(async () => {
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
  }, [currentRoom]);

  // Initial fetch when room changes
  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Poll for updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchRoomData, 2000);
    return () => clearInterval(interval);
  }, [fetchRoomData]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom || isLoading) return;

    try {
      const message = await api.sendMessage(
        {
          room: currentRoom.id,
          message: newMessage,
          user: userId,
        },
        userId
      );
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProposal.text.trim() || !currentRoom || isLoading) return;

    try {
      const proposal = await api.createProposal(
        {
          room: currentRoom.id,
          text: newProposal.text,
          user: userId,
        },
        userId
      );
      setProposals((prev) => [...prev, proposal]);
      setNewProposal({ text: "" });
    } catch (error) {
      console.error("Failed to create proposal:", error);
    }
  };

  const handleVote = async (proposal: Proposal) => {
    if (isLoading) return;

    try {
      if (proposal.user_vote_id) {
        // If we've already voted, delete the vote
        await api.deleteVote(proposal.user_vote_id);
      } else {
        // If we haven't voted, create a new vote
        await api.vote({
          proposal: proposal.id,
          user: userId,
        });
      }
      // Refresh proposals to get updated vote count and user_vote_id
      if (currentRoom) {
        const updatedProposals = await api.getProposals(currentRoom.id);
        setProposals(updatedProposals);
      }
    } catch (error) {
      console.error("Failed to handle vote:", error);
    }
  };

  // Sort messages to show user's messages on the right
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.user === userId && b.user !== userId) return 1;
    if (a.user !== userId && b.user === userId) return -1;
    return new Date(a.created).getTime() - new Date(b.created).getTime();
  });

  if (isLoading) {
    return (
      <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col gap-4 h-full overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

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
                  className={`flex flex-col items-center p-0 h-auto ${
                    proposal.user_vote_id ? "text-purple-500" : ""
                  }`}
                  onClick={() => handleVote(proposal)}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-xs font-bold">
                    {proposal.vote_count}
                  </span>
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      @{proposal.username}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(proposal.created).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 dark:text-gray-200">
                    {proposal.text}
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
              placeholder="Your idea..."
              value={newProposal.text}
              onChange={(e) =>
                setNewProposal((prev) => ({ ...prev, text: e.target.value }))
              }
              className="dark:bg-gray-800 dark:border-gray-700"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="sm"
                disabled={!newProposal.text.trim()}
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
        <CardContent className="flex-1 overflow-y-auto px-3 min-h-0 max-h-[calc(100vh-500px)]">
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.user === userId ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.user === userId
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-gray-500 ${
                        message.user === userId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span className="font-medium mr-1">
                        {message.user === userId ? "You" : message.username}
                      </span>
                      <span>
                        {new Date(message.created).toLocaleTimeString()}
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
