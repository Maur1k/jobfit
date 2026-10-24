import { describe, expect, it } from "vitest";
import { KEY_ERROR_MESSAGES, keyErrorMessage } from "./errors";

describe("key error messages", () => {
  it("maps every known error code", () => {
    for (const [code, message] of Object.entries(KEY_ERROR_MESSAGES)) {
      expect(keyErrorMessage(code)).toBe(message);
    }
  });

  it("does not expose unknown API output", () => {
    expect(keyErrorMessage("unexpected-server-output")).toBe("Something went wrong. Try again.");
    expect(keyErrorMessage(undefined)).toBe("Something went wrong. Try again.");
  });
});
