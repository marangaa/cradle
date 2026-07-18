import assert from "node:assert/strict";
import test from "node:test";
import { issueWidgetToken, verifyWidgetToken } from "./widget-token.js";

test("widget tokens are installation and origin bound", () => {
  const token = issueWidgetToken("installation-a", "https://example.com");
  assert.equal(verifyWidgetToken(token, "installation-a", "https://example.com"), true);
  assert.equal(verifyWidgetToken(token, "installation-b", "https://example.com"), false);
  assert.equal(verifyWidgetToken(token, "installation-a", "https://other.example"), false);
});
