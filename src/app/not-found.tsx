"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if this is an old room URL
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "room" && parts[1]) {
      router.replace(`/room?id=${parts[1]}`);
      return;
    }
    // Otherwise, go home
    router.replace("/");
  }, [pathname, router]);

  return null;
}
