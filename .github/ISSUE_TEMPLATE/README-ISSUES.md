# GitHub Issue Templates - Missing Features

This directory contains issue templates for creating GitHub issues. Six comprehensive issue templates have been created to address critical missing features in the CrowdUp platform.

## New Issue Templates for Missing Features

The following issue template files have been created based on identified platform gaps:

### 1. Company Verification System
**File:** `issue-1-company-verification.md`  
**Type:** Feature Request  
**Priority:** High

Addresses the problem that anyone can claim to represent any company without verification. Proposes a comprehensive verification system with:
- Verification request workflow
- Database schema for verification status
- Visual verification badges
- Admin review interface
- Role-based permissions

### 2. Official Company Responses
**File:** `issue-2-official-company-responses.md`  
**Type:** Feature Request  
**Priority:** High

Enables verified companies to officially respond to user feedback. Features include:
- Different response types (acknowledged, in progress, fixed, etc.)
- Post status management
- Visual distinction for official responses
- Pinned responses
- Company engagement tracking

### 3. Impact Tracking System
**File:** `issue-3-impact-tracking.md`  
**Type:** Feature Request  
**Priority:** Medium

Tracks whether user feedback leads to actual changes. Includes:
- Post status lifecycle
- Implementation tracking
- User impact statistics
- Company reputation metrics
- Notification on status changes
- Analytics dashboard

### 4. Dynamic Trending Page
**File:** `issue-4-dynamic-trending.md`  
**Type:** Bug Report / Enhancement  
**Priority:** High

Fixes the trending page that currently uses hardcoded data. Solution includes:
- Dynamic database queries for trending companies
- Real-time metrics calculation
- Trending topics from actual post data
- Proper database indexes
- Caching strategy for performance

### 5. User Reputation System
**File:** `issue-5-reputation-system.md`  
**Type:** Feature Request  
**Priority:** Medium

Implements a reputation system to establish user credibility. Features:
- Points-based reputation scoring
- Reputation levels (Newcomer to Legend)
- Visual badges and indicators
- Privilege system by level
- Leaderboards and achievements
- Anti-gaming measures

### 6. Company Notifications
**File:** `issue-6-company-notifications.md`  
**Type:** Feature Request  
**Priority:** High

Enables companies to monitor and receive notifications about feedback. Includes:
- Multiple notification channels (in-app, email, push, webhook)
- Granular notification preferences
- Smart filtering and prioritization
- Notification dashboard
- Analytics and insights
- Integration with Slack/Discord

## Feature Dependencies

These features are interconnected and have the following dependencies:

```
Company Verification System
    ↓
Official Company Responses
    ↓
Impact Tracking System
    ↓
Company Notifications

User Reputation System (parallel track)
    ↓
Enhanced Discovery & Trust

Dynamic Trending Page (independent)
```

## How to Use These Templates

These are **documentation files**, not actual GitHub issue form templates. To create issues:

1. **Option A - Manual Creation:**
   - Go to GitHub Issues → New Issue
   - Select the appropriate template (Feature Request or Bug Report)
   - Copy the content from these markdown files
   - Fill in the details

2. **Option B - Programmatic Creation:**
   - Use GitHub CLI or API to create issues
   - Use the content from these files as the issue body
   - Apply the labels specified in the frontmatter

3. **Option C - Convert to YAML:**
   - Convert these markdown files to GitHub issue form YAML format
   - Place them in `.github/ISSUE_TEMPLATE/` with `.yaml` extension
   - GitHub will automatically use them as issue templates

## Labels to Use

Each issue template specifies appropriate labels:

- **Feature Requests:** `Feature Request 🚀`, `Enhancement ✨`
- **Bug Report:** `Bug 🐛`, `Enhancement ✨`
- **Additional:** `Help Wanted 🙋` (for community contributions)

## Implementation Priority

Recommended implementation order:

1. **Phase 1 (Foundation):**
   - Company Verification System
   - Dynamic Trending Page (independent)

2. **Phase 2 (Engagement):**
   - Official Company Responses
   - Company Notifications

3. **Phase 3 (Advanced):**
   - Impact Tracking System
   - User Reputation System

## Related Documentation

- **Issue Label Guidelines:** `labels-guidelines.md`
- **Feature Request Template:** `Feature Request.yaml`
- **Bug Report Template:** `Bug Report.yaml`
- **Enhancement Template:** `Enhancement.yaml`

## Contributing

These issue templates are designed to facilitate community contributions. Each template includes:

- Clear problem statement
- Detailed solution proposal
- Database schema suggestions
- UI/UX examples
- Implementation considerations
- Integration points

Contributors are encouraged to pick up these issues and submit PRs. Mark issues with `Help Wanted 🙋` to attract contributors.
