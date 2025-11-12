export {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  verifyConnection,
} from './connection.js'

export {
  verifyTables,
  printTableVerificationReport,
  verifyTablesOrFail,
} from './verify-tables.js'

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
} from './schema.js'
