import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { supabaseHandlers } from './handlers/supabase';
import { anthropicHandlers } from './handlers/anthropic';

/**
 * This configures a request mocking server with pre-defined
 * response handlers.
 *
 * Docs: https://mswjs.io/docs/api/setup-server
 */
export const server = setupServer(...authHandlers, ...supabaseHandlers, ...anthropicHandlers);
