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
import { Message, Proposal } from "@/types/api";
import * as Tabs from "@radix-ui/react-tabs";
import { roomStateService } from "@/lib/room-state-service";
import { storage } from "@/lib/storage";

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

  const handleVote = (proposalId: number) => {
    roomStateService.vote(proposalId);
  };

  const handleDeleteVote = (voteId: number) => {
    roomStateService.deleteVote(voteId);
  };

  return (
    <div className="w-full md:w-80 h-full flex flex-col">
      <Tabs.Root defaultValue="chat" className="flex-1 flex flex-col h-full">
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
                        {proposal.user_vote_id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteVote(proposal.user_vote_id!)
                            }
                          >
                            Unvote
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote(proposal.id)}
                          >
                            Vote
                          </Button>
                        )}
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
