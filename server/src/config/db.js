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
 * Initialize schema if MySQL is accessible
 */
async function initializeSchema(connection) {
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_code VARCHAR(16) NOT NULL,
        rounds_played INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS match_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        match_id INT NOT NULL,
        player_name VARCHAR(32) NOT NULL,
        score INT NOT NULL,
        rank_position INT NOT NULL,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('✅ [MySQL] Database tables (matches, match_scores) verified.');
  } catch (err) {
    console.warn('⚠️ [MySQL] Schema verification notice:', err.message);
  }
}

/**
 * Test MySQL connection on server startup.
 */
export async function testDatabaseConnection() {
  if (!pool) return false;

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    await initializeSchema(connection);
    connection.release();
    isConnected = true;
    console.log(`✅ [MySQL] Connected to database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ [MySQL] Could not connect to database "${dbConfig.database}" (${error.message}).`);
    console.warn('ℹ️  [MySQL] Note: In-memory gameplay remains fully functional.');
    return false;
  }
}

/**
 * Save match records to database when a game completes
 */
export async function saveMatchResults(roomCode, roundsPlayed, finalScores) {
  if (!isConnected || !pool) return null;

  try {
    const [matchResult] = await pool.query(
      'INSERT INTO matches (room_code, rounds_played) VALUES (?, ?)',
      [roomCode, roundsPlayed]
    );

    const matchId = matchResult.insertId;

    for (let i = 0; i < finalScores.length; i++) {
      const player = finalScores[i];
      await pool.query(
        'INSERT INTO match_scores (match_id, player_name, score, rank_position) VALUES (?, ?, ?, ?)',
        [matchId, player.name, player.score, i + 1]
      );
    }

    console.log(`💾 [MySQL] Saved match record #${matchId} for room ${roomCode}`);
    return matchId;
  } catch (err) {
    console.warn('⚠️ [MySQL] Error saving match record:', err.message);
    return null;
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
