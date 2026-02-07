/**
 * Company Validators
 *
 * Zod schemas for validating company-related inputs.
 */

import { z } from "zod";

/**
 * Valid company categories.
 */
export const CompanyCategoryEnum = z.enum([
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Entertainment",
  "Education",
  "Transportation",
  "Food & Beverage",
  "Real Estate",
  "Other",
]);

/**
 * Valid member roles.
 */
export const CompanyMemberRoleEnum = z.enum(["owner", "admin", "member"]);

/**
 * Company slug validation: lowercase, alphanumeric + hyphens.
 */
const companySlugRegex = /^[a-z0-9-]{3,50}$/;

/**
 * Schema for creating a new company.
 */
export const CreateCompanySchema = z.object({
  name: z
    .string()
    .min(3, "Company slug must be at least 3 characters")
    .max(50, "Company slug must be at most 50 characters")
    .regex(
      companySlugRegex,
      "Company slug can only contain lowercase letters, numbers, and hyphens",
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .nullable()
    .optional(),
  logoUrl: z.string().url("Logo must be a valid URL").nullable().optional(),
  website: z.string().url("Website must be a valid URL").nullable().optional(),
  category: CompanyCategoryEnum.nullable().optional(),
});

/**
 * Schema for updating a company.
 */
export const UpdateCompanySchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .nullable()
    .optional(),
  logoUrl: z.string().url("Logo must be a valid URL").nullable().optional(),
  website: z.string().url("Website must be a valid URL").nullable().optional(),
  category: CompanyCategoryEnum.nullable().optional(),
});

/**
 * Schema for adding a company member.
 */
export const AddCompanyMemberSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
  role: CompanyMemberRoleEnum,
});

/**
 * Schema for company verification request.
 */
export const CompanyVerificationRequestSchema = z.object({
  positionTitle: z
    .string()
    .min(1, "Position title is required")
    .max(100, "Position title must be at most 100 characters"),
  documentUrls: z
    .array(z.string().url("Each document must be a valid URL"))
    .min(1, "At least one document is required")
    .max(5, "Maximum 5 documents allowed"),
  notes: z
    .string()
    .max(1000, "Notes must be at most 1000 characters")
    .optional(),
});

/**
 * Schema for company list query.
 */
export const CompanyListQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: CompanyCategoryEnum.optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

// Inferred types from schemas
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type AddCompanyMemberInput = z.infer<typeof AddCompanyMemberSchema>;
export type CompanyVerificationRequestInput = z.infer<
  typeof CompanyVerificationRequestSchema
>;
export type CompanyListQueryInput = z.infer<typeof CompanyListQuerySchema>;
