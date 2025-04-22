export const POLLING_INTERVAL = 100000000000; // 5 seconds

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  "wss://crowdvibe-prod.lukeisontheroad.com/ws";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://crowdvibe-prod.lukeisontheroad.com/api/v1";
