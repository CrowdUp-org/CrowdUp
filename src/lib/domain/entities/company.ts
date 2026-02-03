/**
 * Company Entity
 *
 * Represents a company/organization in CrowdUp.
 * Domain layer - no external dependencies.
 */

/**
 * Company category types.
 */
export type CompanyCategory =
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Retail'
  | 'Entertainment'
  | 'Education'
  | 'Transportation'
  | 'Food & Beverage'
  | 'Real Estate'
  | 'Other';

/**
 * Core company entity.
 */
export interface Company {
  /** Unique identifier (UUID) */
  id: string;

  /** URL-safe company slug/name */
  name: string;

  /** Display name for UI */
  displayName: string;

  /** Company description */
  description: string | null;

  /** Company logo URL */
  logoUrl: string | null;

  /** Company website URL */
  website: string | null;

  /** Industry category */
  category: CompanyCategory | null;

  /** Owner user ID (if claimed) */
  ownerId: string | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Company member roles.
 */
export type CompanyMemberRole = 'owner' | 'admin' | 'member';

/**
 * Verification status for company members.
 */
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Company member entity (linking users to companies).
 */
export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyMemberRole;
  verified: boolean;
  verificationStatus: VerificationStatus | null;
  verificationDate: Date | null;
  verificationNotes: string | null;
  createdAt: Date;
}

/**
 * Company with aggregated stats for display.
 */
export interface CompanyWithStats extends Company {
  totalPosts: number;
  totalApps: number;
  responseRate: number;
}
