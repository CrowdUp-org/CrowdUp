# GitHub Issue Labels Guidelines

This document explains the purpose of each label used in this repository's GitHub issues and provides guidelines on when to apply them. Proper use of labels helps organize issues, prioritize work, and make the project more accessible to contributors.

Consistent label usage improves filtering, searching, and overall project maintenance.

## Label List

### Bug 🐛
**Description**: Indicates a confirmed defect in the code that causes incorrect behavior, crashes, or unexpected results.

**When to use**:
- The issue is reproducible and represents a real error.

**Examples**:
- "App crashes when saving a file on iOS 18."
- "API returns 500 error for valid requests with special characters."

**Do not use** for non-reproducible issues or user misunderstandings → use **Invalid** instead.

### Dependencies 🔗
**Description**: The issue or pull request is blocked by an external dependency (library update, upstream fix, or related PR).

**When to use**:
- Progress depends on something outside this repository.

**Examples**:
- "Waiting for fix in lodash v5 before upgrading."
- "Blocked until PR #123 is merged."

### Documentation 📚
**Description**: Requests improvements, additions, or fixes to documentation (README, wiki, code comments, guides, etc.).

**When to use**:
- The task involves writing or updating explanatory content.

**Examples**:
- "Add installation instructions for Windows to README."
- "Improve API endpoint examples in the docs."

### Duplicate ↪️
**Description**: The issue is a duplicate of an existing one.

**When to use**:
- Close the newer issue and link to the original.

**Examples**:
- Same bug report as issue #456.

**Compare with**:
- **Invalid** (not a real issue) and **Wontfix** (valid but intentionally not fixed).

### Enhancement 🚀
**Description**: Improvements or minor additions to existing features.

**When to use**:
- Enhances current functionality without introducing major new capabilities.

**Examples**:
- "Add pagination to the user list view."
- "Improve loading speed of dashboard by lazy-loading components."

**Compare with Feature Request**: Use **Enhancement** for refinements to what already exists. Use a separate **Feature Request** label (if available) for entirely new, significant functionality.

### Good First Issue 🌱
**Description**: Simple, well-defined tasks suitable for newcomers or first-time contributors.

**When to use**:
- The task is beginner-friendly and has clear instructions.

**Examples**:
- "Fix typo in error message string."
- "Add missing alt text to images in README."

**Compare with Help Wanted**: **Good First Issue** targets beginners; **Help Wanted** seeks help on more complex tasks.

### Help Wanted 🙋
**Description**: The maintainers explicitly seek community help to resolve this issue.

**When to use**:
- The task is valuable but the core team lacks time or expertise.

**Examples**:
- "Implement OAuth2 integration with Google."
- "Refactor legacy authentication module."

### Invalid 🚫
**Description**: The issue is not valid (not reproducible, user error, out of scope, or insufficient details).

**When to use**:
- After investigation, the report does not represent a real problem.

**Examples**:
- "Feature works as intended, user misunderstood usage."
- "Cannot reproduce with provided steps."

### javascript (or similar tech labels)
**Description**: Categorizes issues related to a specific technology or language (in this case, JavaScript).

**When to use**:
- To filter issues by technical area (combine with other labels).

**Examples**:
- "Race condition in async function."
- "Optimize bundle size with tree shaking."

### Question ❓
**Description**: The issue is a usage question, support request, or request for clarification.

**When to use**:
- Not a bug or feature request, but a need for information.

**Examples**:
- "How do I configure the API key in production?"
- "Best way to extend the base component?"

**Tip**: Frequent questions may indicate a need for **Documentation** improvements.

### Task 🔄
**Description**: General to-do items, maintenance, refactoring, or chores not tied to bugs or enhancements.

**When to use**:
- Routine work without visible user impact.

**Examples**:
- "Upgrade ESLint to latest version."
- "Clean up unused imports across the codebase."

**Compare with Enhancement**: **Task** is neutral maintenance; **Enhancement** adds noticeable value.

### Wontfix 🔴
**Description**: The issue is valid but will not be addressed (out of scope, too costly, deprecated platform, etc.).

**When to use**:
- A conscious decision not to fix or implement.

**Examples**:
- "Add support for Internet Explorer 11" (no longer supported).
- "Implement rarely requested export format."

## Best Practices
- Combine labels when appropriate (e.g., **Bug** + **javascript** + **Good First Issue**).
- Use **Good First Issue** and **Help Wanted** to encourage contributions.
- For major new functionality, consider creating a custom **Feature Request** label to distinguish it from **Enhancement**.
- Maintainers: Keep label descriptions up to date in GitHub settings for tooltips.

Thank you for helping keep our issues organized!
