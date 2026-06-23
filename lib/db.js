import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'digital_library',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Helper function that returns just the results (for compatibility)
// For SELECT: returns array of rows
// For INSERT/UPDATE/DELETE: returns ResultSetHeader object (with insertId, affectedRows, etc.)
export async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    // For INSERT/UPDATE/DELETE, results is a ResultSetHeader object
    // For SELECT, results is an array of rows
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Export db object with query method for files that use db.query()
const db = {
  query: async (sql, params) => {
    try {
      const [results] = await pool.execute(sql, params);
      return [results]; // Return as array to match mysql2 pattern [rows, fields]
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  execute: async (sql, params) => {
    try {
      return await pool.execute(sql, params);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
};

export default db;