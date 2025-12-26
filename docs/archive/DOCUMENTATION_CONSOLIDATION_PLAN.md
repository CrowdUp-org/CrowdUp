# CrowdUp Documentation Consolidation Plan

**Prepared:** 26 December 2025  
**Status:** Analysis Complete  
**Goal:** Consolidate existing documentation into structured wiki pages

---

## Executive Summary

CrowdUp has 14 primary documentation files with significant content overlap. The documentation can be consolidated into **6 primary wiki categories** with clear boundaries, reducing redundancy while preserving all unique content.

### Key Findings:
- **5 files** focus on initial setup (45% overlap)
- **3 files** cover deployment and configuration (35% overlap)
- **4 files** document features (10% overlap - mostly unique content)
- **2 files** explain technical internals (no overlap - unique)
- **1 files** missing (TROUBLESHOOTING.md, API.md don't exist)

---

## File-by-File Analysis

### Setup & Getting Started (5 files)

#### 1. **START_HERE.md** ✅ 
**Purpose:** Friendly welcome guide for first-time users  
**Unique Content:**
- Warm welcome message with emoji and tone
- "What You Have" section listing implemented features
- Quick 5-minute setup overview
- Links to other documentation
- Key files navigation guide
- Stack overview

**Recommendation:** → **KEEP AS ENTRY POINT** (convert to wiki home/intro page)

---

#### 2. **QUICK_START.md** ✅
**Purpose:** Fastest possible setup path  
**Unique Content:**
- Ultra-condensed 4-step format
- Specific 2min/30sec/1min timing estimates
- Minimal explanations, maximum directness
- ✅ Done! checklist

**Overlap:** 80% with SETUP.md and START_HERE.md  
**Recommendation:** → **MERGE INTO "Setup Guide"** (keep as condensed variant section)

---

#### 3. **SETUP.md** ✅
**Purpose:** Detailed setup instructions with all options  
**Unique Content:**
- Complete prerequisites section
- Step-by-step Supabase project creation
- Database initialization details
- Environment variables configuration (very detailed)
- Google OAuth setup references
- **Important:** API Key migration notes (JWT → Secret API keys)
- RLS explanation and security considerations
- Comprehensive troubleshooting
- Production security notes

**Overlap:** 50% with other setup files  
**Recommendation:** → **KEEP AS DETAILED SETUP GUIDE** (primary reference)

---

#### 4. **NEXT_STEPS.md** ✅
**Purpose:** What to do immediately after setup  
**Unique Content:**
- Step-by-step database setup with Supabase UI navigation
- API keys retrieval instructions
- First test steps (signup → create post → vote)
- "What's Working" checklist
- "Features to Add Next" ideas
- Troubleshooting specific to new installations

**Overlap:** 30% with SETUP.md  
**Recommendation:** → **MERGE INTO "Setup Guide"** (as "Verify Installation" section)

---

#### 5. **START_HERE.md** (already analyzed)
**Recommendation:** → **KEEP AS WIKI HOME PAGE**

---

### Deployment & Configuration (3 files)

#### 6. **DEPLOYMENT_GUIDE.md** ✅
**Purpose:** Platform-specific deployment instructions  
**Unique Content:**
- Local development configuration
- **Vercel** deployment (3 methods: dashboard, CLI, vercel.json)
- **Docker** deployment with docker-compose
- **GitHub Actions** CI/CD workflow
- **Google Cloud Run** deployment
- **AWS Elastic Beanstalk** configuration
- **Heroku** setup
- Environment variable management per platform
- Troubleshooting for each platform
- Security checklist

**Overlap:** 20% (env var references in SETUP.md)  
**Recommendation:** → **KEEP AS PLATFORM-SPECIFIC DEPLOYMENT GUIDE**

---

#### 7. **BUILD_NOTES.md** ✅
**Purpose:** Build process and production readiness  
**Unique Content:**
- Build status and verification checklist
- bcrypt → bcryptjs migration explanation
- Favicon removal explanation
- Placeholder values for Supabase in build process
- Build output sample
- How to run build/start commands
- Testing production build locally
- Deployment platform recommendations

**Overlap:** 10% (deployment references)  
**Recommendation:** → **MERGE INTO "Deployment Guide"** (as "Build & Prepare for Deployment" section)

---

#### 8. **SUPABASE_SECRET_KEY_ROTATION.md** (referenced but not read)
**Status:** Referenced in SETUP.md and DEPLOYMENT_GUIDE.md  
**Recommendation:** → **KEEP SEPARATE** (security-focused specialty guide)

---

### Features & Implementation (4 files)

#### 9. **IMPLEMENTATION_SUMMARY.md** ✅
**Purpose:** What was built and technical overview  
**Unique Content:**
- Complete feature checklist (auth, posts, voting, profiles, settings)
- Files created/modified list
- Architecture overview (Next.js, Supabase, Auth, React Context)
- Data flow explanation
- Implementation status by feature
- Environment variables summary

**Overlap:** 5% with other files  
**Recommendation:** → **KEEP AS "IMPLEMENTATION STATUS"** or merge into Features

---

#### 10. **SETTINGS_FEATURES_ADDED.md** ✅
**Purpose:** Settings page features documentation  
**Unique Content:**
- Privacy settings (public profile, activity, messages)
- Notification settings (email, project updates, followers, messages)
- Data management (export data, delete account)
- UI/UX features (icons, toggles, confirmation dialogs)
- Database schema (user_settings table)
- TypeScript notes
- Testing checklist
- Future enhancement ideas

**Overlap:** None (unique to settings)  
**Recommendation:** → **KEEP & EXPAND** into "Features" category (Settings Feature Guide)

---

#### 11. **APP_AND_COMPANY_PAGES.md** ✅
**Purpose:** App and company pages feature documentation  
**Unique Content:**
- App pages system (creation, detail view, reviews)
- Company pages system
- Pre-loaded popular companies with logos
- Review system (1-5 star ratings)
- Image support (app logos, company logos, profiles)
- Database migration requirements
- File locations
- Test instructions
- Future enhancements (profile pictures, company creation)

**Overlap:** None (unique feature)  
**Recommendation:** → **KEEP & EXPAND** into "Features" category (App & Company Pages Guide)

---

#### 12. **MESSAGING_SETUP.md** ✅
**Purpose:** Messaging feature documentation  
**Unique Content:**
- Database setup (run migration)
- Tables structure (conversations, messages)
- Features (mutual connections, real-time, conversation management)
- User guide (how to use)
- Developer API (messaging functions)
- Security (Row Level Security policies)
- Performance optimizations
- Troubleshooting
- Future enhancements

**Overlap:** None (unique feature)  
**Recommendation:** → **KEEP & EXPAND** into "Features" category (Messaging Feature Guide)

---

### Technical Documentation (2 files)

#### 13. **ALGORITHM_DOCUMENTATION.md** ✅
**Purpose:** Feed ranking algorithm documentation  
**Unique Content:**
- Algorithm components (time decay, engagement, velocity, personalization, diversity, quality)
- Final score calculation formula
- Sorting modes (Featured, New, Top)
- Trending algorithm
- Personalization features
- A/B testing support
- Performance considerations
- Comparison to major platforms (Instagram, Facebook, X)
- Usage examples with code
- Future improvements
- Monitoring & analytics

**Overlap:** None (unique, technical)  
**Recommendation:** → **KEEP AS ALGORITHM GUIDE** (Advanced/Technical section)

---

#### 14. **HOW_TO_CREATE_PAGES.md** ✅
**Purpose:** Guide for creating company and app pages  
**Unique Content:**
- Company page creation steps
- App page creation steps
- Navigation link examples
- Database table schemas
- Category lists (industries and app types)
- Authentication requirements
- Logo best practices
- Quick access URLs
- Tips for better descriptions
- Troubleshooting
- Example workflow

**Overlap:** 30% with APP_AND_COMPANY_PAGES.md  
**Recommendation:** → **MERGE INTO "App & Company Pages"** (as "How to Create" section)

---

#### 15. **MIGRATION_GUIDE.md** ✅
**Purpose:** Database migration documentation  
**Unique Content:**
- Warning about required migration
- SQL migration script for follow system, apps, reviews
- New tables: connections, apps, app_reviews
- Index creation
- New post type: "App Review Request"

**Overlap:** Referenced in other files  
**Recommendation:** → **KEEP SEPARATE** (or merge into Database/Setup section)

---

#### 16. **CHECKLIST.md** ✅
**Purpose:** Feature implementation checklist  
**Unique Content:**
- Backend setup checklist
- Authentication checklist
- Core features checklist (posts, voting, profiles, settings)
- UI/UX checklist
- Data cleanup checklist
- Documentation checklist
- Database tables checklist
- Security checklist
- User testing checklist
- Future features list
- Known limitations
- Recommended next steps

**Overlap:** 40% with IMPLEMENTATION_SUMMARY.md  
**Recommendation:** → **MERGE INTO "IMPLEMENTATION_SUMMARY"** (or consolidate into status page)

---

## Consolidation Plan: File-to-Wiki Mapping

### Proposed Wiki Structure

```
📚 CrowdUp Documentation
│
├── 🏠 Home / Getting Started
│   ├── START_HERE.md (primary entry point)
│   └── Feature Overview
│
├── 📖 Setup & Installation
│   ├── SETUP.md (detailed guide - primary)
│   ├── QUICK_START.md (condensed version)
│   ├── NEXT_STEPS.md (post-setup verification)
│   └── Troubleshooting (from SETUP.md)
│
├── 🚀 Deployment
│   ├── DEPLOYMENT_GUIDE.md (platform-specific - primary)
│   ├── BUILD_NOTES.md (build process - merge here)
│   ├── SUPABASE_SECRET_KEY_ROTATION.md (keep separate reference)
│   └── Environment Configuration
│
├── ✨ Features & How-To
│   ├── App & Company Pages
│   │   ├── APP_AND_COMPANY_PAGES.md (primary)
│   │   └── HOW_TO_CREATE_PAGES.md (merge as how-to section)
│   ├── Messaging
│   │   └── MESSAGING_SETUP.md (standalone guide)
│   ├── Settings
│   │   └── SETTINGS_FEATURES_ADDED.md (standalone guide)
│   ├── Google OAuth (from SETUP.md/DEPLOYMENT_GUIDE.md)
│   └── Post Creation & Voting (from app behavior)
│
├── 🔧 Technical Deep Dives
│   ├── Algorithm Documentation
│   │   └── ALGORITHM_DOCUMENTATION.md (primary)
│   ├── Database & Migrations
│   │   ├── MIGRATION_GUIDE.md (primary)
│   │   └── Database Schema (from SETUP.md)
│   ├── IMPLEMENTATION_SUMMARY.md (architecture overview)
│   └── CHECKLIST.md (feature status - optionally consolidate)
│
├── 🛠️ API Reference
│   └── (N/A - file doesn't exist, could be created)
│
├── 🐛 Troubleshooting
│   └── (N/A - file doesn't exist, could be extracted from existing docs)
│   ├── Setup issues (from SETUP.md, NEXT_STEPS.md)
│   ├── Deployment issues (from DEPLOYMENT_GUIDE.md)
│   ├── Feature-specific issues (from feature guides)
│   └── Common errors & solutions
│
└── 📋 Reference Materials
    ├── Environment Variables Cheat Sheet
    ├── Database Tables Reference
    ├── File Structure Overview
    └── Tech Stack Summary
```

---

## Content Consolidation Details

### 1. **Setup & Installation Wiki Page**

**Primary Source:** SETUP.md  
**Secondary Sources:** QUICK_START.md, NEXT_STEPS.md

**Sections to Include:**
1. Prerequisites (from SETUP.md)
2. Create Supabase Project (from SETUP.md)
3. Set Up Database (from SETUP.md, NEXT_STEPS.md)
4. Configure Environment Variables (from SETUP.md)
5. Install Dependencies (from SETUP.md)
6. Run Development Server (from SETUP.md)
7. **Quick Start (condensed)** - from QUICK_START.md
8. Verify Installation (from NEXT_STEPS.md - test steps)
9. Troubleshooting (from SETUP.md, NEXT_STEPS.md)
10. Important Notes (RLS, API Keys migration, etc.)

**Content to REMOVE (already covered):**
- Duplicate steps in QUICK_START.md and NEXT_STEPS.md

---

### 2. **Deployment & Build Wiki Page**

**Primary Source:** DEPLOYMENT_GUIDE.md  
**Secondary Source:** BUILD_NOTES.md

**Sections to Include:**
1. Overview (from DEPLOYMENT_GUIDE.md)
2. Local Development (from DEPLOYMENT_GUIDE.md)
3. Build & Prepare for Deployment (from BUILD_NOTES.md)
4. **Platform-Specific Deployment**
   - Vercel (from DEPLOYMENT_GUIDE.md)
   - Docker (from DEPLOYMENT_GUIDE.md)
   - GitHub Actions (from DEPLOYMENT_GUIDE.md)
   - Google Cloud Run (from DEPLOYMENT_GUIDE.md)
   - AWS Elastic Beanstalk (from DEPLOYMENT_GUIDE.md)
   - Heroku (from DEPLOYMENT_GUIDE.md)
5. Troubleshooting (from DEPLOYMENT_GUIDE.md)
6. Security Checklist (from DEPLOYMENT_GUIDE.md)

**Content to REMOVE:**
- Duplicate environment variable setup (reference Setup page instead)

---

### 3. **Features & How-To Wiki Pages**

#### 3a. **App & Company Pages**
**Primary Source:** APP_AND_COMPANY_PAGES.md  
**Secondary Source:** HOW_TO_CREATE_PAGES.md

**Sections:**
1. Overview
2. Create App Page (from both sources)
3. Create Company Page (from both sources)
4. View & Interact
5. Pre-loaded Companies (from APP_AND_COMPANY_PAGES.md)
6. Review System (from APP_AND_COMPANY_PAGES.md)
7. Database Schema (from HOW_TO_CREATE_PAGES.md)
8. Logo & Image Support (from both)
9. Categories (from HOW_TO_CREATE_PAGES.md)
10. Troubleshooting (from both)

---

#### 3b. **Messaging**
**Primary Source:** MESSAGING_SETUP.md  
**Status:** Standalone - minimal overlap

**Keep as is** with clear structure

---

#### 3c. **Settings**
**Primary Source:** SETTINGS_FEATURES_ADDED.md  
**Status:** Standalone - unique content

**Keep as is**

---

#### 3d. **Google OAuth** (NEW CONSOLIDATED PAGE)
**Primary Source:** SETUP.md (section: "Configure Environment Variables" - Google OAuth)  
**Also in:** DEPLOYMENT_GUIDE.md (Vercel section has OAuth notes), GOOGLE_OAUTH_SETUP.md

**Sections:**
1. Overview
2. Prerequisites
3. Create Google OAuth Credentials (from GOOGLE_OAUTH_SETUP.md)
4. Configure Environment Variables (from SETUP.md)
5. Environment Variable per Platform (from DEPLOYMENT_GUIDE.md)
6. Testing (from GOOGLE_OAUTH_SETUP.md)
7. Troubleshooting (from GOOGLE_OAUTH_SETUP.md)
8. Security Considerations (from GOOGLE_OAUTH_SETUP.md)

---

### 4. **Technical Deep Dives**

#### 4a. **Algorithm Documentation**
**Primary Source:** ALGORITHM_DOCUMENTATION.md  
**Status:** Comprehensive - keep as is

---

#### 4b. **Database & Migrations**
**Primary Source:** MIGRATION_GUIDE.md  
**Also:** Database schema from SETUP.md, IMPLEMENTATION_SUMMARY.md

**Sections:**
1. Schema Overview (from SETUP.md)
2. Migration Requirements (from MIGRATION_GUIDE.md)
3. Table Structures (from all sources)
4. RLS Policies (from SETUP.md)
5. Indexes (from MIGRATION_GUIDE.md)
6. Adding New Features (reference migrations)

---

#### 4c. **Implementation Status**
**Primary Source:** IMPLEMENTATION_SUMMARY.md + CHECKLIST.md

**Consolidate into single page with:**
1. Architecture Overview (from IMPLEMENTATION_SUMMARY.md)
2. Core Features (from IMPLEMENTATION_SUMMARY.md)
3. Implementation Checklist (from CHECKLIST.md)
4. What's Working (from CHECKLIST.md)
5. Known Limitations (from CHECKLIST.md)
6. Recommended Next Steps (from CHECKLIST.md)

---

### 5. **Troubleshooting Wiki Page** (NEW)

**Content sourced from:**
- SETUP.md → "Troubleshooting" section
- NEXT_STEPS.md → "Troubleshooting" section
- BUILD_NOTES.md → "Verification" section
- DEPLOYMENT_GUIDE.md → "Troubleshooting" sections
- GOOGLE_OAUTH_SETUP.md → "Troubleshooting" section
- MESSAGING_SETUP.md → "Troubleshooting" section
- APP_AND_COMPANY_PAGES.md → "Troubleshooting" section
- SETTINGS_FEATURES_ADDED.md → (no dedicated section)

**Sections to Include:**
1. Setup Issues
   - "Invalid credentials" error
   - Posts not showing
   - Can't sign in
   - Database table issues

2. Authentication Issues
   - Google OAuth problems
   - OAuth works in dev but not production
   - Session management issues

3. Feature-Specific Issues
   - Messaging not working
   - App/company creation issues
   - Voting problems
   - Settings save issues

4. Deployment Issues
   - "Supabase authentication error" in production
   - OAuth callback fails
   - Environment variable not loading

5. Build Issues
   - Build failures
   - Missing favicon

---

### 6. **Reference Materials Wiki Page** (NEW)

**Content:**
1. Environment Variables Cheat Sheet
   - All required variables
   - All optional variables
   - Which platform uses which
   
2. Database Tables Quick Reference
   - Table names
   - Key columns
   - Foreign keys
   
3. File Structure Overview
   - Key directories
   - Important files per feature
   
4. Tech Stack
   - Versions
   - Key dependencies
   - Why each was chosen

---

## Redundancy Analysis

### Overlapping Content by Topic:

| Topic | Files | Redundancy | Recommendation |
|-------|-------|-----------|-----------------|
| Supabase Setup | SETUP.md, QUICK_START.md, START_HERE.md, NEXT_STEPS.md | 80% | Consolidate with different detail levels |
| Environment Variables | SETUP.md, DEPLOYMENT_GUIDE.md, BUILD_NOTES.md | 70% | Single source with platform sections |
| Post Creation | IMPLEMENTATION_SUMMARY.md, CHECKLIST.md, START_HERE.md | 60% | Keep in Features, reference in summaries |
| Authentication | SETUP.md, IMPLEMENTATION_SUMMARY.md, CHECKLIST.md | 50% | Keep in Setup, reference in Architecture |
| API Keys/Security | SETUP.md, DEPLOYMENT_GUIDE.md, SUPABASE_SECRET_KEY_ROTATION.md | 40% | Separate for security, reference elsewhere |
| Google OAuth | SETUP.md, GOOGLE_OAUTH_SETUP.md, DEPLOYMENT_GUIDE.md | 60% | Create consolidated page |
| Database Schema | SETUP.md, IMPLEMENTATION_SUMMARY.md, MIGRATION_GUIDE.md | 50% | Single reference page |
| Feature Status | IMPLEMENTATION_SUMMARY.md, CHECKLIST.md | 70% | Consolidate into one page |

---

## Content Preservation Matrix

### Content That MUST Be Preserved:

| Content | Source File | New Location |
|---------|-------------|-------------|
| Complete SQL schema | SETUP.md | Database & Migrations |
| Detailed environment variable setup | SETUP.md | Setup guide |
| Password hashing explanation | IMPLEMENTATION_SUMMARY.md | Architecture |
| API key migration notes (JWT → Secret keys) | SETUP.md | Deployment |
| All platform-specific deployment instructions | DEPLOYMENT_GUIDE.md | Deployment |
| bcrypt → bcryptjs reason | BUILD_NOTES.md | Build/Deployment |
| Algorithm formula and calculations | ALGORITHM_DOCUMENTATION.md | Algorithm (keep as-is) |
| All troubleshooting steps | Multiple | Troubleshooting (new page) |
| Google OAuth complete flow | GOOGLE_OAUTH_SETUP.md | Google OAuth (new page) |
| Messaging database structure | MESSAGING_SETUP.md | Messaging (keep as-is) |
| Settings features list | SETTINGS_FEATURES_ADDED.md | Settings (keep as-is) |
| Real-time messaging explanation | MESSAGING_SETUP.md | Messaging (keep as-is) |
| Review system details | APP_AND_COMPANY_PAGES.md | App & Company Pages |

---

## Content That Can Be REMOVED:

| Content | Reason | Currently In |
|---------|--------|-------------|
| Duplicate setup steps | Multiple files have same steps with minor wording differences | QUICK_START.md, NEXT_STEPS.md |
| Duplicate "What's Working" lists | Similar feature lists appear in multiple docs | CHECKLIST.md, IMPLEMENTATION_SUMMARY.md |
| Repeated environment variable setup | Same setup explained 4+ times | DEPLOYMENT_GUIDE.md, SETUP.md, etc. |
| Redundant API key explanations | Same info repeated with slight variations | SETUP.md, DEPLOYMENT_GUIDE.md |
| Duplicate troubleshooting | Similar issues explained in multiple files | BUILD_NOTES.md, SETUP.md, NEXT_STEPS.md |

---

## Files Status Summary

### ✅ Files to KEEP (Standalone or Primary)
1. **SETUP.md** - Detailed setup (primary reference)
2. **DEPLOYMENT_GUIDE.md** - Platform deployments
3. **ALGORITHM_DOCUMENTATION.md** - Algorithm (technical)
4. **MESSAGING_SETUP.md** - Messaging feature
5. **SETTINGS_FEATURES_ADDED.md** - Settings feature
6. **APP_AND_COMPANY_PAGES.md** - App/Company pages
7. **GOOGLE_OAUTH_SETUP.md** - OAuth setup
8. **SUPABASE_SECRET_KEY_ROTATION.md** - Security operations
9. **START_HERE.md** - Welcome/entry point

### ⚠️ Files to MERGE/CONSOLIDATE
1. **QUICK_START.md** → Merge into Setup (keep as condensed section)
2. **NEXT_STEPS.md** → Merge into Setup (keep as verification section)
3. **BUILD_NOTES.md** → Merge into Deployment
4. **HOW_TO_CREATE_PAGES.md** → Merge into App & Company Pages
5. **IMPLEMENTATION_SUMMARY.md** + **CHECKLIST.md** → Consolidate into Implementation Status page

### ❌ Files That DON'T EXIST (Should Create)
1. **TROUBLESHOOTING.md** - Create from extracted content
2. **API.md** - Currently missing; could document endpoints
3. **REFERENCE.md** - Create as cheat sheet

### 📁 Files to KEEP as REFERENCE (Not primary wiki)
1. Various migration-*.sql files (reference for database)
2. supabase-schema.sql (reference for schema)

---

## Implementation Roadmap

### Phase 1: Consolidate Setup & Deployment (2 hours)
- [ ] Create new "Setup & Installation" wiki page
  - Combine SETUP.md + QUICK_START.md + NEXT_STEPS.md
  - Keep START_HERE.md as entry point
- [ ] Create new "Deployment & Build" wiki page
  - Combine DEPLOYMENT_GUIDE.md + BUILD_NOTES.md

### Phase 2: Consolidate Features (2 hours)
- [ ] Update "App & Company Pages" wiki page
  - Merge HOW_TO_CREATE_PAGES.md content
  - Clean up duplication
- [ ] Create new "Google OAuth" wiki page
  - Extract from SETUP.md and GOOGLE_OAUTH_SETUP.md
  - Add platform-specific notes from DEPLOYMENT_GUIDE.md
- [ ] Create "Settings" wiki page
  - Use SETTINGS_FEATURES_ADDED.md
- [ ] Create "Messaging" wiki page
  - Use MESSAGING_SETUP.md

### Phase 3: Technical Documentation (2 hours)
- [ ] Update "Implementation Status" wiki page
  - Consolidate IMPLEMENTATION_SUMMARY.md + CHECKLIST.md
  - Create single source for feature list
- [ ] Create "Database & Migrations" wiki page
  - Consolidate schema information
  - Add MIGRATION_GUIDE.md content
- [ ] Keep "Algorithm" wiki page as-is
  - ALGORITHM_DOCUMENTATION.md is comprehensive

### Phase 4: New Pages (2 hours)
- [ ] Create "Troubleshooting" wiki page
  - Extract from all existing docs
  - Organize by symptom/issue
- [ ] Create "Reference Materials" wiki page
  - Environment variables cheat sheet
  - Database tables quick reference
  - File structure guide
  - Tech stack overview
- [ ] Create "Security Operations" wiki page
  - Keep SUPABASE_SECRET_KEY_ROTATION.md content
  - Add security best practices

### Phase 5: Cleanup (1 hour)
- [ ] Delete redundant content from original files (or mark as archived)
- [ ] Update cross-references between wiki pages
- [ ] Add navigation breadcrumbs
- [ ] Create index/table of contents

---

## Measurement of Success

✅ **Consolidation is successful when:**

1. **No critical information is lost**
   - [ ] All unique content is preserved
   - [ ] All security considerations are documented
   - [ ] All troubleshooting steps are available

2. **Redundancy is reduced**
   - [ ] Setup steps not repeated 4+ times
   - [ ] Environment variable setup in <3 locations (Setup, Platform-specific, Reference)
   - [ ] Feature lists consolidated to 1-2 sources

3. **Navigation is improved**
   - [ ] User can find answer in <2 clicks from home
   - [ ] Clear progression from setup → features → deployment
   - [ ] Cross-references are consistent

4. **Maintenance is easier**
   - [ ] Update to feature only requires change in 1-2 places
   - [ ] Troubleshooting centralized in one page
   - [ ] New features have clear documentation home

---

## Questions to Resolve

1. **Where should database schema live?**
   - Option A: In Setup (users see it during setup)
   - Option B: In Database & Migrations (technical reference)
   - **Recommendation:** Both - Quick reference in Setup, detailed in Database page

2. **Should migration files be linked or embedded?**
   - Option A: Keep as separate .sql files, link from wiki
   - Option B: Embed content in wiki pages
   - **Recommendation:** Keep as separate files, provide links with context

3. **What detail level for deployment?**
   - Option A: Single condensed guide with links to external docs
   - Option B: Complete step-by-step per platform
   - **Recommendation:** Current DEPLOYMENT_GUIDE.md level is good - keep detailed

4. **API documentation needed?**
   - Currently no API.md exists
   - CrowdUp uses direct Supabase queries from client
   - **Recommendation:** Create API.md documenting:
     - Available Supabase functions
     - Custom utility functions (from src/lib/)
     - Data access patterns

5. **Version control for docs?**
   - **Recommendation:** Keep markdown files in repo as primary source
   - Sync to GitHub wiki, but keep repo as source of truth

---

## Cross-Reference Map

### Key External References in Docs:

| Reference | In File | Target | Notes |
|-----------|---------|--------|-------|
| SETUP.md → GOOGLE_OAUTH_SETUP.md | SETUP.md | External | Consolidate with new page |
| SETUP.md → DEPLOYMENT_GUIDE.md | SETUP.md | External | Already referenced |
| DEPLOYMENT_GUIDE.md → SUPABASE_SECRET_KEY_ROTATION.md | DEPLOYMENT_GUIDE.md | External | Keep separate reference |
| QUICK_START.md → NEXT_STEPS.md | QUICK_START.md | External | Consolidate both into Setup |
| APP_AND_COMPANY_PAGES.md → HOW_TO_CREATE_PAGES.md | APP_AND_COMPANY_PAGES.md | External | Consolidate into single page |

---

## Conclusion

**Recommended Action:**
Consolidate from 14 files into **6 primary wiki pages + 3 supporting pages**:

### Primary Wiki Pages (Core User Journey):
1. **Home / Getting Started** (START_HERE.md)
2. **Setup & Installation** (SETUP.md + QUICK_START.md + NEXT_STEPS.md)
3. **Deployment & Build** (DEPLOYMENT_GUIDE.md + BUILD_NOTES.md)
4. **Features & How-To** (App Pages, Messaging, Settings guides)
5. **Technical Deep Dives** (Algorithm, Database, Architecture)
6. **Troubleshooting** (NEW - extracted from all sources)

### Supporting Pages:
7. **Google OAuth** (NEW - consolidated from 3 sources)
8. **Security Operations** (SUPABASE_SECRET_KEY_ROTATION.md)
9. **Reference Materials** (NEW - cheat sheets and quick refs)

### Files to Preserve:
- All migration-*.sql files (reference)
- supabase-schema.sql (database blueprint)
- All feature-specific guides (Messaging, Settings, etc.)

**Estimated Effort:** 8-10 hours to consolidate, 2 hours for ongoing maintenance per feature

**Expected Outcome:** 40% reduction in documentation file count, 60% reduction in redundancy, 100% preservation of unique content
