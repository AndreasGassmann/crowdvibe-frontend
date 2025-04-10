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
import { Send, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import { Message, Proposal, Room, Round, Leaderboard } from "@/types/api";
import { useUser } from "@/contexts/user-context";
import { POLLING_INTERVAL } from "@/lib/config";
import * as Tabs from "@radix-ui/react-tabs";
import { roomStateService } from "@/lib/room-state-service";
import { RoomState } from "@/lib/room-state-service";
import { useLoading } from "@/contexts/loading-context";

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newProposal, setNewProposal] = useState<{
    text: string;
  }>({ text: "" });
  const { userId, isLoading } = useUser();
  const { isLoading: loading } = useLoading();

  useEffect(() => {
    const subscription = roomStateService.getState().subscribe((state) => {
      setMessages(state.messages);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to room state changes
  useEffect(() => {
    const subscription = roomStateService
      .getState()
      .subscribe((state: RoomState) => {
        setMessages(state.messages);
        setProposals(state.proposals);
        setCurrentRound(state.currentRound);
        setLeaderboard(state.leaderboard);
      });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to current room changes
  useEffect(() => {
    const subscription = roomStateService
      .getCurrentRoom()
      .subscribe((room: Room | null) => {
        setCurrentRoom(room);
      });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsData = await api.getRooms();
        if (roomsData.length > 0) {
          roomStateService.connect("9675eee6-7e4b-4143-8b55-96fd47e5a748");
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch proposals and rounds when room changes
  const fetchRoomData = useCallback(() => {
    if (!currentRoom) return;
    roomStateService.requestProposals();
    roomStateService.requestRounds();
  }, [currentRoom]);

  // Fetch leaderboard data when room or round changes
  useEffect(() => {
    if (!currentRoom || !currentRound) return;
    roomStateService.requestLeaderboard();
  }, [currentRoom, currentRound]);

  // Initial fetch when room changes
  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(fetchRoomData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRoomData]);

  const handleSendMessage = () => {
    if (newMessage.trim() && !loading) {
      roomStateService.sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleCreateProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProposal.text.trim() || !currentRoom || !currentRound || isLoading)
      return;

    try {
      roomStateService.createProposal(newProposal.text, currentRound.id);
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
        roomStateService.deleteVote(proposal.user_vote_id);
      } else {
        // If we haven't voted, create a new vote
        roomStateService.vote(proposal.id);
      }
    } catch (error) {
      console.error("Failed to handle vote:", error);
    }
  };

  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
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
    <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col gap-4 h-full overflow-y-auto">
      {currentRound && (
        <Card className="dark:border-gray-800">
          <CardHeader className="pb-2 px-3">
            <CardTitle className="text-lg dark:text-white">
              Round {currentRound.counter} Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No scores yet
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm dark:text-white">
                        {index + 1}.
                      </span>
                      <span className="text-sm dark:text-gray-200">
                        @{entry.username}
                      </span>
                    </div>
                    <span className="font-medium text-sm dark:text-white">
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Suggestions List */}
      <Card className="flex-shrink-0 dark:border-gray-800">
        <CardHeader className="pb-0 px-3">
          <CardTitle className="text-lg dark:text-white">Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <Tabs.Root defaultValue="view" className="w-full">
            <Tabs.List className="flex w-full border-b border-gray-200 dark:border-gray-700 mb-4">
              <Tabs.Trigger
                value="view"
                className="flex-1 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400"
              >
                Top Suggestions
              </Tabs.Trigger>
              <Tabs.Trigger
                value="submit"
                className="flex-1 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400"
              >
                Submit Idea
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="view" className="space-y-2">
              {proposals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No suggestions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                          {proposal.first_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm dark:text-white break-words">
                          {proposal.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            @{proposal.first_name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            •
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {proposal.vote_count} votes
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${
                          proposal.user_vote_id
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                        onClick={() => handleVote(proposal)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Content>
            <Tabs.Content value="submit">
              <form onSubmit={handleCreateProposal} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Enter your idea..."
                  value={newProposal.text}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, text: e.target.value })
                  }
                  className="w-full"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!newProposal.text.trim() || isLoading}
                >
                  Submit
                </Button>
              </form>
            </Tabs.Content>
          </Tabs.Root>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex-1 flex flex-col dark:border-gray-800">
        <CardHeader className="pb-0 px-3 flex-shrink-0">
          <CardTitle className="text-lg dark:text-white">
            Community Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-3">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No messages yet
            </p>
          ) : (
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
                        {message.first_name.slice(0, 2).toUpperCase()}
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
                          {message.user === userId ? "You" : message.first_name}
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
          )}
        </CardContent>
        <CardFooter className="p-2 border-t dark:border-gray-800 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 dark:bg-gray-800 dark:border-gray-700"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || isLoading}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
