---
name: Impact Tracking System
about: Track whether user feedback leads to actual changes
title: "[FEATURE]: Impact Tracking System for User Feedback"
labels: ["Feature Request 🚀", "Enhancement ✨"]
assignees: []
---

## Is your feature request related to a problem?

Users currently have no way to know if their feedback leads to actual changes or improvements. This creates several issues:

- Users don't know if companies act on their feedback
- No visibility into which suggestions get implemented
- Users can't track the lifecycle of their feedback
- No motivation for users to provide quality feedback
- Platform lacks metrics to show its effectiveness
- Companies get no credit for being responsive

This lack of transparency reduces user engagement and diminishes the platform's value proposition.

## Describe the solution you'd like

Implement a comprehensive impact tracking system that shows the lifecycle and outcomes of user feedback:

1. **Post Status Lifecycle:**
   - New → Acknowledged → In Progress → Resolved/Implemented/Fixed → Closed
   - Add `status` enum to posts table
   - Add `status_history` JSONB to track status changes with timestamps
   - Add `resolution_date` timestamp

2. **Impact Indicators:**
   - "Implemented" badge on resolved posts
   - Timeline showing status changes
   - Link to release notes or update announcements
   - Attribution showing which users reported the issue

3. **Database Schema:**
   ```sql
   ALTER TABLE posts ADD COLUMN status TEXT CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'implemented', 'wont_fix', 'duplicate', 'closed')) DEFAULT 'open';
   ALTER TABLE posts ADD COLUMN resolution_date TIMESTAMPTZ;
   ALTER TABLE posts ADD COLUMN status_history JSONB DEFAULT '[]';
   ALTER TABLE posts ADD COLUMN impact_score INTEGER DEFAULT 0;
   
   CREATE TABLE post_updates (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
     company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
     update_type TEXT NOT NULL CHECK (update_type IN ('status_change', 'release_note', 'announcement')),
     old_status TEXT,
     new_status TEXT,
     content TEXT,
     release_version TEXT,
     release_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **User Profile Impact Stats:**
   - Show number of implemented suggestions per user
   - Display impact score/points
   - Highlight most impactful contributions
   - Show success rate percentage

5. **Company Reputation Metrics:**
   - Response rate: % of posts acknowledged
   - Resolution rate: % of acknowledged posts resolved
   - Average time to response
   - Average time to resolution
   - Display these metrics on company pages

6. **Notification System:**
   - Notify users when their post status changes
   - Notify when a related feature is released
   - Email digest of implemented suggestions

7. **Analytics Dashboard:**
   - For users: Track their feedback impact
   - For companies: Track responsiveness metrics
   - Platform-wide: Overall resolution statistics

## Describe alternatives you've considered

1. **Simple Status Only:** Just add status field without history - simpler but loses valuable timeline data
2. **External Integration:** Link to company issue trackers (JIRA, GitHub) - complex integration, not all companies use these
3. **Manual Updates Only:** Rely on users to report implementations - inaccurate and incomplete

## Additional context

This feature builds upon the Official Company Responses feature and creates a complete feedback loop between users and companies.

**Example UI:**

```
Post Status: ✅ Implemented (45 days)

Timeline:
• Feb 1: Posted by @user
• Feb 3: ✓ Acknowledged by Instagram
• Feb 10: 🔄 In Progress
• Mar 15: ✅ Implemented in v2.4.0

Impact: This suggestion helped 1,247 users
```

**Key Metrics to Display:**
- Time from submission to acknowledgment
- Time from acknowledgment to resolution
- Number of users who upvoted/benefited
- Related posts that were also resolved

**Integration Points:**
- Company response system (status updates)
- User reputation system (award points for implemented suggestions)
- Notification system (alert users of status changes)
- Analytics dashboards (track platform effectiveness)

**Related Issues:**
- Requires: Official Company Responses
- Integrates with: User Reputation System
- Enhances: Company Notifications

## Contribution

- [ ] I am willing to submit a PR for this feature
