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
import { Send, Trophy } from "lucide-react";
import { Message, Proposal } from "@/types/api";
import * as Tabs from "@radix-ui/react-tabs";
import { roomStateService } from "@/lib/room-state-service";
import { storage } from "@/lib/storage";

// Sample leaderboard data
const leaderboardData = [
  { id: 1, name: "Private Cheetah", score: 850, rank: 1 },
  { id: 2, name: "Husky Sheep", score: 720, rank: 2 },
  { id: 3, name: "Eventual Rat", score: 680, rank: 3 },
  { id: 4, name: "Curious Fox", score: 560, rank: 4 },
  { id: 5, name: "Silent Eagle", score: 490, rank: 5 },
];

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUsername = storage.getUsername();

  useEffect(() => {
    const subscription = roomStateService.getState().subscribe((state) => {
      setMessages(state.messages);
      setProposals(state.proposals);
    });

    // Request initial proposals
    roomStateService.requestProposals();

    return () => subscription.unsubscribe();
  }, []);

  const handleVote = (proposalId: string) => {
    roomStateService.vote(proposalId);
  };

  const handleDeleteVote = (proposalId: string) => {
    roomStateService.deleteVote(proposalId);
  };

  return (
    <div className="w-full md:w-80 h-full flex flex-col">
      <Tabs.Root
        defaultValue="leaderboard"
        className="flex-1 flex flex-col h-full"
      >
        <Tabs.List className="flex border-b">
          <Tabs.Trigger
            value="leaderboard"
            className="flex-1 py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            Leaderboard
          </Tabs.Trigger>
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

        <Tabs.Content
          value="leaderboard"
          className="flex-1 flex flex-col h-full"
        >
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2 pr-2 h-full">
                <div className="grid grid-cols-12 text-sm font-medium text-gray-500 dark:text-gray-400 py-2 border-b">
                  <div className="col-span-1">#</div>
                  <div className="col-span-7">Player</div>
                  <div className="col-span-4 text-right">Score</div>
                </div>
                {leaderboardData.map((player) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-12 py-3 border-b border-gray-100 dark:border-gray-800 items-center"
                  >
                    <div className="col-span-1 font-bold">{player.rank}</div>
                    <div className="col-span-7 flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {player.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="col-span-4 text-right font-bold">
                      {player.score}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="chat" className="flex-1 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4 pr-2 h-full">
                {messages.map((message) => {
                  const isOwnMessage = message.username === currentUsername;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-2 ${
                        isOwnMessage ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {message.first_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`${isOwnMessage ? "text-right" : ""}`}>
                        <p className="font-medium text-sm">
                          {message.first_name}
                        </p>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex-shrink-0">
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

        <Tabs.Content value="proposals" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Proposals</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4 pr-2 h-full">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarFallback>
                            {proposal.first_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{proposal.first_name}</p>
                          <p className="text-sm text-gray-500">
                            {proposal.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {proposal.vote_count} votes
                        </span>
                        <Button
                          variant={
                            currentUsername &&
                            proposal.users_voted.includes(currentUsername)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            currentUsername &&
                            proposal.users_voted.includes(currentUsername)
                              ? handleDeleteVote(proposal.id)
                              : handleVote(proposal.id)
                          }
                        >
                          {currentUsername &&
                          proposal.users_voted.includes(currentUsername)
                            ? "Unvote"
                            : "Vote"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const proposalText = formData.get("proposal") as string;
                  if (proposalText.trim()) {
                    roomStateService.createProposal(proposalText);
                    e.currentTarget.reset();
                  }
                }}
                className="flex space-x-2 w-full"
              >
                <Input
                  name="proposal"
                  placeholder="Enter your proposal..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
