import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'doodlz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (error) {
  console.warn('⚠️ [MySQL] Pool initialization deferred:', error.message);
}

/**
 * Test MySQL connection on server startup.
 * Non-blocking and graceful: logs clear diagnostic message without crashing the server.
 */
export async function testDatabaseConnection() {
  if (!pool) {
    console.warn('⚠️ [MySQL] Database pool is not initialized. Running without active DB.');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log(`✅ [MySQL] Successfully connected to database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ [MySQL] Could not connect to database "${dbConfig.database}" (${error.message}).`);
    console.warn('ℹ️  [MySQL] Note: Transient multiplayer game state does not depend on MySQL. DB features will resume when MySQL is accessible.');
    return false;
  }
}

export function getDatabaseStatus() {
  return {
    connected: isConnected,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
  };
}

export default pool;
