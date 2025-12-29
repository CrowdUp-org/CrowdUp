// Helper: validate and normalize image URLs. Returns normalized URL if safe, null otherwise.
export function validateAndNormalizeImageSrc(src: string): string | null {
  try {
    // Parse URL with current origin as base to normalize both absolute and relative paths
    const url = new URL(src, window.location.origin);

    // Check that protocol is safe (http or https)
    const allowedProtocols = ["http:", "https:"];
    if (!allowedProtocols.includes(url.protocol)) {
      return null;
    }

    // Restrict to same-origin images to avoid leaking requests to arbitrary domains
    if (url.origin !== window.location.origin) {
      return null;
    }

    return url.href;
  } catch {
    // URL parsing failed, treat as unsafe
    return null;
  }
}

// Helper to check if element can be made contentEditable
export const isTextEditable = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  // Elements that typically contain text and can be made contentEditable
  const editableTags = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "span",
    "div",
    "li",
    "td",
    "th",
    "label",
    "a",
    "button",
  ];

  // Check if it's already contentEditable or an input/textarea
  if (
    element.contentEditable === "true" ||
    tagName === "input" ||
    tagName === "textarea"
  ) {
    return true;
  }

  // Allow editing if element contains text and is an editable tag
  // Only allow editing if element has at most 1 child OR has direct text content
  if (editableTags.includes(tagName) && element.textContent?.trim()) {
    // Check if element has direct text nodes (not just text from children)
    const hasDirectText = Array.from(element.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );

    // Allow editing if:
    // 1. Element has no children (pure text element)
    // 2. Element has 1 or fewer children AND has direct text content
    if (
      element.childElementCount === 0 ||
      (element.childElementCount <= 1 && hasDirectText)
    ) {
      return true;
    }
  }

  return false;
};
