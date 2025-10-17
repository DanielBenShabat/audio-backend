import { neon } from '@neondatabase/serverless';

/**
 * Neon database configuration for REST API operations
 */
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_NF0g8jHTBXxm@ep-purple-credit-abft5hvr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const NEON_REST_API_URL = process.env.NEON_REST_API_URL || 
  'https://ep-purple-credit-abft5hvr.apirest.eu-west-2.aws.neon.tech/neondb/rest/v1';

/**
 * Neon serverless client for database operations
 */
export const neonClient = neon(NEON_DATABASE_URL);

/**
 * Configuration object for Neon database operations
 */
export const NEON_CONFIG = {
  databaseUrl: NEON_DATABASE_URL,
  restApiUrl: NEON_REST_API_URL,
  branchId: 'br-summer-leaf-ab5044q8',
  computeId: 'ep-purple-credit-abft5hvr'
} as const;

export default neonClient;
