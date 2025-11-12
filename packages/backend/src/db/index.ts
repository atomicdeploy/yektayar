export {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  verifyConnection,
} from './connection'

export {
  verifyTables,
  printTableVerificationReport,
  verifyTablesOrFail,
} from './verify-tables'

export {
  REQUIRED_TABLES,
  OPTIONAL_TABLES,
  ALL_TABLES,
  CREATE_SESSIONS_TABLE,
  CREATE_USERS_TABLE,
  CREATE_PERMISSIONS_TABLE,
  CREATE_ROLES_TABLE,
  CREATE_USER_GROUPS_TABLE,
  CREATE_USER_IDENTIFIERS_TABLE,
  type TableDefinition,
} from './schema'
