"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function WelcomePage() {
  const [firstName, setFirstName] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        await api.updateFirstname(firstName.trim());
        router.push("/rooms");
      } catch (err: unknown) {
        console.error("Failed to set first name:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save name. Please try again."
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CrowdVibe
          </h1>
          <p className="text-gray-600 mb-8">
            CrowdVibe is your platform for real-time audience engagement and
            feedback. Join rooms, participate in live polls, and share your
            thoughts with the community.
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              What&apos;s your first name?
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your first name"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-2 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={!firstName.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Start"}
          </button>
        </form>
      </div>
    </div>
  );
}
