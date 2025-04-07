// components/about-tab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Github, Twitter, Globe } from "lucide-react";

export default function AboutTab() {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">
          About CrowdVibe
        </h3>
        <p className="dark:text-gray-300">
          CrowdVibe is a collaborative game development platform where the
          community works together to build and evolve games. Anyone can
          contribute code, suggest features, and vote on the best ideas.
        </p>

        <h4 className="text-md font-semibold mt-4 mb-2 dark:text-white">
          How It Works
        </h4>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>
            <strong className="dark:text-gray-200">Submit Suggestions:</strong>{" "}
            Propose code changes or new features for the game.
          </li>
          <li>
            <strong className="dark:text-gray-200">Vote on Ideas:</strong> The
            community votes on the best suggestions.
          </li>
          <li>
            <strong className="dark:text-gray-200">Implementation:</strong>{" "}
            Top-voted suggestions are implemented in the next update.
          </li>
          <li>
            <strong className="dark:text-gray-200">Regular Updates:</strong> The
            game is updated regularly with new community contributions.
          </li>
        </ol>

        <h4 className="text-md font-semibold mt-4 mb-2 dark:text-white">
          Rules & Guidelines
        </h4>
        <ul className="list-disc pl-5 space-y-1 dark:text-gray-300">
          <li>Be respectful and constructive in your feedback</li>
          <li>Test your code before submitting</li>
          <li>Keep suggestions focused on improving the game</li>
          <li>Give credit to other contributors when building on their work</li>
        </ul>
      </div>

      <Card className="mt-6 dark:border-gray-800">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 dark:text-white">Connect With Us</h4>
          <div className="flex flex-col space-y-2">
            <a
              href="#"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Github className="h-4 w-4 mr-2" />
              <span>github.com/crowdvibe</span>
            </a>
            <a
              href="#"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Twitter className="h-4 w-4 mr-2" />
              <span>@crowdvibe</span>
            </a>
            <a
              href="#"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span>www.crowdvibe.dev</span>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
        CrowdVibe © 2023 • Version 1.0.0
      </div>
    </div>
  );
}
