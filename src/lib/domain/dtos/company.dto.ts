/**
 * Company DTOs
 *
 * Data Transfer Objects for company operations.
 * Domain layer - no external dependencies.
 */

import type { CompanyCategory, CompanyMemberRole } from '../entities/company';

/**
 * DTO for creating a new company.
 */
export interface CreateCompanyDTO {
  /** URL-safe slug (3-50 chars, lowercase, alphanumeric + hyphens) */
  name: string;

  /** Display name (1-100 chars) */
  displayName: string;

  /** Company description (optional, max 2000 chars) */
  description?: string | null;

  /** Logo URL (optional) */
  logoUrl?: string | null;

  /** Website URL (optional, must be valid URL) */
  website?: string | null;

  /** Industry category (optional) */
  category?: CompanyCategory | null;
}

/**
 * DTO for updating a company.
 * Only owner or admin can update.
 */
export interface UpdateCompanyDTO {
  /** Display name (optional, 1-100 chars) */
  displayName?: string;

  /** Description (optional, max 2000 chars) */
  description?: string | null;

  /** Logo URL (optional) */
  logoUrl?: string | null;

  /** Website URL (optional) */
  website?: string | null;

  /** Industry category (optional) */
  category?: CompanyCategory | null;
}

/**
 * DTO for adding a company member.
 */
export interface AddCompanyMemberDTO {
  /** User ID to add */
  userId: string;

  /** Member role */
  role: CompanyMemberRole;
}

/**
 * DTO for company verification request.
 */
export interface CompanyVerificationRequestDTO {
  /** Company position/role description */
  positionTitle: string;

  /** Verification documents (URLs or base64) */
  documentUrls: string[];

  /** Additional notes */
  notes?: string;
}

/**
 * DTO for company listing query.
 */
export interface CompanyListQueryDTO {
  /** Search query */
  search?: string;

  /** Filter by category */
  category?: CompanyCategory;

  /** Page number (1-based) */
  page?: number;

  /** Items per page (default 20, max 100) */
  limit?: number;
}
