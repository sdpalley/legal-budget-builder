import navigation from "./navigation.cjs";
import { describe, expect, it } from "vitest";

const { isSafeExternalUrl, isSameDocumentNavigation } = navigation;

describe("Electron navigation boundary", () => {
  it.each([
    "https://example.com/help",
    "https://subdomain.example.com/path?source=app#section",
  ])("allows ordinary HTTPS links in the system browser: %s", (url) => {
    expect(isSafeExternalUrl(url)).toBe(true);
  });

  it.each([
    "http://example.com",
    "file:///private/tmp/secret",
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "mailto:person@example.com",
    "https://user:password@example.com",
    "not a url",
  ])("rejects unsafe or unsupported external targets: %s", (url) => {
    expect(isSafeExternalUrl(url)).toBe(false);
  });

  it("allows only hash changes within the loaded application document", () => {
    const current =
      "file:///Applications/Legal%20Budget%20Builder/dist/index.html";

    expect(isSameDocumentNavigation(`${current}#output`, current)).toBe(true);
    expect(
      isSameDocumentNavigation(
        "file:///Applications/Legal%20Budget%20Builder/dist/other.html",
        current,
      ),
    ).toBe(false);
    expect(isSameDocumentNavigation("https://example.com", current)).toBe(
      false,
    );
  });
});
