// components/side-panel.tsx
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

export default function SidePanel() {
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
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center p-0 h-auto"
                >
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-xs font-bold">{10 - item}</span>
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      @user{item}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {item * 5}m ago
                    </span>
                    {item % 2 === 0 ? (
                      <Code className="h-3 w-3 text-purple-500" />
                    ) : (
                      <MessageSquare className="h-3 w-3 text-pink-500" />
                    )}
                  </div>
                  <p className="text-sm line-clamp-2 dark:text-gray-200">
                    {item === 1
                      ? "Add gravity to the game physics"
                      : item === 2
                      ? "Create a scoring system"
                      : "Add colorful background"}
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
          <div className="space-y-3">
            <Input
              placeholder="Share your code or feature suggestion..."
              className="min-h-[60px] dark:bg-gray-800 dark:border-gray-700"
            />

            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-purple-500" />
                  <span className="text-sm dark:text-gray-300">Code</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                  <span className="text-sm dark:text-gray-300">Feature</span>
                </div>
              </div>

              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="sm"
              >
                Submit
              </Button>
            </div>
          </div>
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
            {[1, 2].map((item) => (
              <div
                key={item}
                className={`flex ${
                  item % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    item % 2 === 0 ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {item % 2 === 0 ? "YO" : "SY"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        item % 2 === 0
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <p className="text-sm">
                        {item % 2 === 0
                          ? "I think we should add a jumping mechanic to the game."
                          : "Welcome to CrowdVibe! Discuss game ideas and collaborate with others here."}
                      </p>
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-gray-500 ${
                        item % 2 === 0 ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="font-medium mr-1">
                        {item % 2 === 0 ? "You" : "System"}
                      </span>
                      <span>12:34 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-3 border-t dark:border-gray-800 flex-shrink-0">
          <form className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              className="flex-1 dark:bg-gray-800 dark:border-gray-700"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
