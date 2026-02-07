/**
 * Company Service
 *
 * Business logic for company operations including CRUD,
 * validation, ownership, and authorization.
 */

import { companyRepository } from "@/lib/infrastructure/repositories/company.repository";
import {
  CreateCompanySchema,
  UpdateCompanySchema,
} from "@/lib/validators/company.validator";
import type { Company } from "@/lib/domain/entities/company";
import type {
  CreateCompanyDTO,
  UpdateCompanyDTO,
} from "@/lib/domain/dtos/company.dto";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../errors";

/**
 * Maximum companies a user can own.
 */
const MAX_COMPANIES_PER_USER = 5;

/**
 * Company service with business logic and validation.
 */
export const companyService = {
  /**
   * Creates a new company with validation.
   *
   * @param rawData - Unvalidated company creation data
   * @param ownerId - Owner's user ID
   * @returns Created company entity
   * @throws ValidationError - If input validation fails
   * @throws BusinessRuleError - If business rules are violated
   */
  async createCompany(rawData: unknown, ownerId: string): Promise<Company> {
    // 1. Validate input
    const parseResult = CreateCompanySchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    const dto: CreateCompanyDTO = parseResult.data;

    // 2. Check if company name is available
    const nameAvailable = await companyRepository.isNameAvailable(dto.name);
    if (!nameAvailable) {
      throw new BusinessRuleError(
        `Company slug "${dto.name}" is already taken`,
        "COMPANY_NAME_TAKEN",
      );
    }

    // 3. Check user hasn't exceeded company limit
    const ownedCompanies = await companyRepository.findByOwner(ownerId);
    if (ownedCompanies.length >= MAX_COMPANIES_PER_USER) {
      throw new BusinessRuleError(
        `Maximum ${MAX_COMPANIES_PER_USER} companies per user exceeded`,
        "COMPANY_LIMIT_EXCEEDED",
      );
    }

    // 4. Create via repository
    return await companyRepository.create(dto, ownerId);
  },

  /**
   * Retrieves a company by ID.
   *
   * @param id - Company ID
   * @returns Company entity
   * @throws NotFoundError - If company does not exist
   */
  async getCompanyById(id: string): Promise<Company> {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company", id);
    }
    return company;
  },

  /**
   * Retrieves a company by URL slug/name.
   *
   * @param name - Company name/slug
   * @returns Company entity
   * @throws NotFoundError - If company does not exist
   */
  async getCompanyByName(name: string): Promise<Company> {
    const company = await companyRepository.findByName(name);
    if (!company) {
      throw new NotFoundError("Company", name);
    }
    return company;
  },

  /**
   * Updates an existing company with authorization check.
   *
   * @param id - Company ID
   * @param rawData - Unvalidated update data
   * @param userId - Requesting user's ID
   * @returns Updated company entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If company does not exist
   * @throws ForbiddenError - If user is not the company owner
   */
  async updateCompany(
    id: string,
    rawData: unknown,
    userId: string,
  ): Promise<Company> {
    // 1. Validate input
    const parseResult = UpdateCompanySchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    // 2. Check existence and ownership
    const existingCompany = await companyRepository.findById(id);
    if (!existingCompany) {
      throw new NotFoundError("Company", id);
    }

    if (existingCompany.ownerId !== userId) {
      throw new ForbiddenError("Not authorized to update this company");
    }

    // 3. Build update DTO
    const dto: UpdateCompanyDTO = parseResult.data;

    // 4. Update via repository
    return await companyRepository.update(id, dto);
  },

  /**
   * Deletes a company with authorization check.
   *
   * @param id - Company ID
   * @param userId - Requesting user's ID
   * @param isAdmin - Whether the user has admin privileges
   * @throws NotFoundError - If company does not exist
   * @throws ForbiddenError - If user is not authorized to delete
   */
  async deleteCompany(
    id: string,
    userId: string,
    isAdmin = false,
  ): Promise<void> {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company", id);
    }

    if (company.ownerId !== userId && !isAdmin) {
      throw new ForbiddenError("Not authorized to delete this company");
    }

    await companyRepository.delete(id);
  },

  /**
   * Checks if a user owns a company.
   *
   * @param companyId - Company ID
   * @param userId - User ID
   * @returns True if user is the owner
   */
  async checkOwnership(companyId: string, userId: string): Promise<boolean> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      return false;
    }
    return company.ownerId === userId;
  },

  /**
   * Retrieves companies owned by a user.
   *
   * @param ownerId - Owner's user ID
   * @returns Array of company entities
   */
  async getCompaniesByOwner(ownerId: string): Promise<Company[]> {
    return await companyRepository.findByOwner(ownerId);
  },

  /**
   * Retrieves all companies with pagination.
   *
   * @param limit - Maximum number of companies (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of company entities
   */
  async getAllCompanies(limit = 20, offset = 0): Promise<Company[]> {
    return await companyRepository.findAll(limit, offset);
  },

  /**
   * Searches companies by display name.
   *
   * @param query - Search query
   * @param limit - Maximum number of results (default 20)
   * @returns Array of matching company entities
   */
  async searchCompanies(query: string, limit = 20): Promise<Company[]> {
    return await companyRepository.search(query, limit);
  },

  /**
   * Retrieves companies by category.
   *
   * @param category - Company category
   * @param limit - Maximum number of companies (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of company entities
   */
  async getCompaniesByCategory(
    category: string,
    limit = 20,
    offset = 0,
  ): Promise<Company[]> {
    return await companyRepository.findByCategory(category, limit, offset);
  },

  /**
   * Checks if a company name/slug is available.
   *
   * @param name - Company name to check
   * @returns True if available
   */
  async isNameAvailable(name: string): Promise<boolean> {
    return await companyRepository.isNameAvailable(name);
  },
};
