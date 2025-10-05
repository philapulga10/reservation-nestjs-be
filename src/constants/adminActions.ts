// Re-export from contracts package for backward compatibility
export {
  AdminActions,
  ADMIN_ACTIONS,
  ADMIN_ACTIONS_ARRAY,
  TAdminAction,
  parseAdminAction,
} from '@mini-pn/contracts';

// Keep the old export for backward compatibility
export {
  ADMIN_ACTIONS as ADMIN_ACTIONS_OLD,
  TAdminAction as AdminAction,
} from '@mini-pn/contracts';
