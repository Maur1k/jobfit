export const KEY_ERROR_MESSAGES: Record<string, string> = {
  invalid_key: "Google didn't recognize this key. Copy it again from AI Studio.",
  free_tier_unavailable: "The free tier isn't available in your region. Enable billing in AI Studio, or skip AI for now.",
  rate_limit: "You've reached the free limit for now. Wait a minute and try again.",
  network: "Couldn't reach Google. Check connection and retry.",
  missing_key: "Enter a Gemini API key to continue.",
  upstream: "Google returned an unexpected error. Try again shortly.",
};

export function keyErrorMessage(code: string | undefined): string {
  return (code && KEY_ERROR_MESSAGES[code]) ?? "Something went wrong. Try again.";
}
