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
import { Send, Trophy, ListChecks, MessageSquare } from "lucide-react";
import { Message, Proposal, Leaderboard } from "@/types/api";
import { roomStateService } from "@/lib/room-state-service";
import { storage } from "@/lib/storage";

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUsername = storage.getUsername();

  useEffect(() => {
    const subscription = roomStateService.getState().subscribe((state) => {
      setMessages(state.messages);
      setProposals(state.proposals);
      setLeaderboard(state.leaderboard);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleVote = (proposalId: string) => {
    roomStateService.vote(proposalId);
  };

  const handleDeleteVote = (proposalId: string) => {
    roomStateService.deleteVote(proposalId);
  };

  return (
    <div className="w-full h-full flex flex-col px-2 bg-gray-100 dark:bg-gray-950">
      {/* Leaderboard Section */}
      <Card className="flex-1 flex flex-col min-h-0 border-t-0 border-x-0 rounded-t-md dark:border-gray-800 py-1 my-1">
        <CardHeader className="flex-shrink-0 px-1.5 py-1 border-b dark:border-gray-800">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 min-h-0">
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs font-medium text-gray-500 dark:text-gray-400 pb-1 border-b dark:border-gray-800">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Player</div>
              <div className="col-span-3 text-right">Score</div>
              <div className="col-span-2 text-right">Tries</div>
            </div>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-12 py-1 items-center text-xs"
                >
                  <div className="col-span-1 font-bold">{index + 1}</div>
                  <div className="col-span-6 flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {entry.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">
                      {entry.username}
                    </span>
                  </div>
                  <div className="col-span-3 text-right font-bold">
                    {entry.score}
                  </div>
                  <div className="col-span-2 text-right font-medium text-gray-500">
                    {entry.tries}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-500">
                No entries yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proposals Section */}
      <Card className="flex-1 flex flex-col min-h-0 border-t border-x-0 rounded-md dark:border-gray-800 py-1 my-1">
        <CardHeader className="flex-shrink-0 px-1.5 py-1 border-b dark:border-gray-800">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-blue-500" />
            Proposals
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-1.5 border dark:border-gray-700 rounded text-xs"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {proposal.first_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium truncate">
                        {proposal.first_name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 break-words">
                        {proposal.text}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
                    <span className="text-xs whitespace-nowrap">
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
                      className="h-6 px-2 text-xs"
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
            ))
          ) : (
            <div className="text-center py-4 text-xs text-gray-500">
              No proposals yet.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-shrink-0 p-1.5 border-t dark:border-gray-800">
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
            className="flex space-x-1 w-full"
          >
            <Input
              name="proposal"
              placeholder="Enter proposal..."
              className="flex-1 h-7 text-xs px-2"
            />
            <Button type="submit" size="icon" className="h-7 w-7">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Chat Section */}
      <Card className="flex-1 flex flex-col min-h-0 border-t border-b-0 border-x-0 rounded-b-md dark:border-gray-800 py-1 my-1">
        <CardHeader className="flex-shrink-0 px-1.5 py-1 border-b dark:border-gray-800">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-green-500" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isOwnMessage = message.username === currentUsername;
              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-1.5 text-xs ${
                    isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {message.first_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-1.5 rounded ${
                      isOwnMessage
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <p className="font-medium text-xs">
                      {isOwnMessage ? "You" : message.first_name}
                    </p>
                    <p className="break-words">{message.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-xs text-gray-500">
              No messages yet.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-shrink-0 p-1.5 border-t dark:border-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newMessage.trim()) {
                roomStateService.sendMessage(newMessage);
                setNewMessage("");
              }
            }}
            className="flex space-x-1 w-full"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 h-7 text-xs px-2"
            />
            <Button type="submit" size="icon" className="h-7 w-7">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
