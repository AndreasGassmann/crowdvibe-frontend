"use client";

import { useState, useEffect, useRef } from "react";
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
import { roomStateService, RoomState } from "@/lib/room-state-service";
import { storage } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";

interface SidePanelProps {
  roomState: RoomState;
  sendMessage: (message: string) => void;
  timeLeft: number;
  showNotification: (
    title: string,
    options?: NotificationOptions
  ) => Notification | null;
  chatMessagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function SidePanel({
  roomState,
  sendMessage,
  timeLeft,
  showNotification,
  chatMessagesEndRef,
}: SidePanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const currentUsername = storage.getUsername();
  const isGenerating = timeLeft < 0;
  const previousMessagesLength = useRef(0);
  const previousRoundCounter = useRef<number | null>(null);

  useEffect(() => {
    if (roomState.messages.length > previousMessagesLength.current) {
      const newMessages = roomState.messages.slice(
        previousMessagesLength.current
      );
      newMessages.forEach((msg) => {
        if (msg.type === "user" && msg.username !== currentUsername) {
          // Disable notifications for now
          // showNotification(`New Message from ${msg.first_name}`, {
          //   body: msg.message,
          //   icon: "/images/icon.png",
          // });
        }
      });
    }
    previousMessagesLength.current = roomState.messages.length;

    if (
      roomState.currentRound &&
      roomState.currentRound.counter !== previousRoundCounter.current
    ) {
      if (previousRoundCounter.current !== null) {
        showNotification(`Round ${roomState.currentRound.counter} Started!`, {
          body: "A new round has begun.",
          icon: "/images/icon.png",
        });
      }
      previousRoundCounter.current = roomState.currentRound.counter;
    }
  }, [
    roomState.messages,
    roomState.currentRound,
    currentUsername,
    showNotification,
  ]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollTop =
        chatMessagesEndRef.current.scrollHeight;
    }
  }, [roomState.messages, chatMessagesEndRef]);

  const handleVote = (proposalId: string) => {
    roomStateService.vote(proposalId);
  };

  const handleDeleteVote = (proposalId: string) => {
    roomStateService.deleteVote(proposalId);
  };

  return (
    <div className="w-full h-full flex flex-col px-2 bg-gray-100 dark:bg-gray-950">
      {/* Leaderboard Section - Basis 1/4 */}
      <Card className="flex flex-col min-h-0 border-t-0 border-x-0 rounded-t-md dark:border-gray-800 py-0 basis-1/4">
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
            {roomState.leaderboard.length > 0 ? (
              roomState.leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 py-1 items-center text-xs ${
                    entry.username === currentUsername
                      ? "bg-blue-50 dark:bg-blue-900/20 rounded"
                      : ""
                  }`}
                >
                  <div className="col-span-1 font-bold">{index + 1}</div>
                  <div className="col-span-6 flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {(entry.first_name || entry.username)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">
                      {entry.first_name || entry.username}
                      {entry.username === currentUsername && (
                        <span className="ml-1 text-blue-500 dark:text-blue-400">
                          (you)
                        </span>
                      )}
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

      {/* Proposals Section - Basis 3/8 */}
      <Card className="flex flex-col min-h-0 border-t border-x-0 rounded-md dark:border-gray-800 py-0 basis-3/8">
        <CardHeader className="flex-shrink-0 px-1.5 py-1 border-b dark:border-gray-800">
          {isGenerating ? (
            <div className="flex items-center justify-center text-xs text-gray-500 italic space-x-1.5">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
              <span>Generating new round...</span>
            </div>
          ) : (
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 text-blue-500" />
              Proposals
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {roomState.proposals.length > 0 ? (
            roomState.proposals.map((proposal) => (
              <div
                key={proposal.id}
                className={`p-1.5 border dark:border-gray-700 rounded text-xs ${
                  proposal.username === currentUsername
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
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
                        {proposal.username === currentUsername && (
                          <span className="ml-1 text-blue-500 dark:text-blue-400">
                            (you)
                          </span>
                        )}
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
                      disabled={isGenerating}
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
              if (proposalText.trim() && !isGenerating) {
                roomStateService.createProposal(proposalText);
                e.currentTarget.reset();
              }
            }}
            className="flex space-x-1 w-full"
          >
            <Input
              name="proposal"
              placeholder={
                isGenerating ? "Generating new round..." : "Enter proposal..."
              }
              className="flex-1 h-7 text-xs px-2"
              disabled={isGenerating}
            />
            <Button
              type="submit"
              size="icon"
              className="h-7 w-7"
              disabled={isGenerating}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Chat Section - Basis 3/8 */}
      <Card className="flex flex-col min-h-0 border-t border-b-0 border-x-0 rounded-b-md dark:border-gray-800 py-0 basis-3/8">
        <CardHeader className="flex-shrink-0 px-1.5 py-1 border-b dark:border-gray-800">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-green-500" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent
          ref={chatMessagesEndRef}
          className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0"
        >
          {roomState.messages.length > 0 ? (
            roomState.messages.map((message) => {
              if (message.type === "system") {
                return (
                  <div
                    key={message.id}
                    className="text-center text-xs italic text-gray-500 dark:text-gray-400 py-1"
                  >
                    {message.message}
                  </div>
                );
              }

              const isOwnMessage = message.username === currentUsername;
              const timestamp = formatDistanceToNow(new Date(message.created), {
                addSuffix: true,
              });

              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-1.5 text-xs ${
                    isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-5 w-5 flex-shrink-0 mt-1">
                    <AvatarFallback className="text-xs">
                      {message.first_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
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
                    <span className="text-xxs text-gray-400 dark:text-gray-500 mt-0.5 px-1">
                      {timestamp}
                    </span>
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
                sendMessage(newMessage);
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
