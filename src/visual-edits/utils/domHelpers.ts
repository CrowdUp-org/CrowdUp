// Helper to make only text nodes editable and protect child elements
export const protectChildElements = (element: HTMLElement) => {
  // Make all child elements non-editable
  const childElements = element.querySelectorAll("*");
  childElements.forEach((child) => {
    const childEl = child as HTMLElement;
    childEl.contentEditable = "false";
    // Add a data attribute to mark protected elements
    childEl.setAttribute("data-orchids-protected", "true");
    // Only prevent text selection within the child elements when parent is being edited
    // But still allow pointer events for hovering and clicking
    childEl.style.userSelect = "none";
    childEl.style.webkitUserSelect = "none";
    // Don't set pointerEvents to none - we want to allow hover and click
  });
};

// Helper to restore child elements after editing
export const restoreChildElements = (element: HTMLElement) => {
  const protectedElements = element.querySelectorAll(
    '[data-orchids-protected="true"]',
  );
  protectedElements.forEach((child) => {
    const childEl = child as HTMLElement;
    childEl.removeAttribute("contenteditable");
    childEl.removeAttribute("data-orchids-protected");
    // Restore original styles
    childEl.style.userSelect = "";
    childEl.style.webkitUserSelect = "";
  });
};

// Helper to extract only text nodes from an element (excluding child element text)
export const extractDirectTextContent = (element: HTMLElement): string => {
  let text = "";
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
    }
  }
  return text;
};

// Helper to parse data-orchids-id to extract file path, line, and column
export const parseOrchidsId = (
  orchidsId: string,
): { filePath: string; line: number; column: number } | null => {
  // Format: "filepath:line:column"
  const parts = orchidsId.split(":");
  if (parts.length < 3) return null;

  // The file path might contain colons, so we need to handle that
  const column = parseInt(parts.pop() || "0");
  const line = parseInt(parts.pop() || "0");
  const filePath = parts.join(":"); // Rejoin the remaining parts as the file path

  if (isNaN(line) || isNaN(column)) return null;

  return { filePath, line, column };
};

// Helper to wrap multiline text only when it contains line breaks
export const wrapMultiline = (text: string): string => {
  if (text.includes("\n")) {
    const escaped = text.replace(/\n/g, "\\n");
    // Wrap in {` ... `} so JSX will interpret it as a template literal
    return `{\`${escaped}\`}`;
  }
  return text;
};
