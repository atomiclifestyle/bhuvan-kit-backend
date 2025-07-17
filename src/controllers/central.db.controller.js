import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config()

const URI = process.env.NEON_URI;

if (!URI) {
  throw new Error('NEON_URI environment variable is not defined');
}

const sequelize = new Sequelize(URI, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const isReadOnlyQuery = (sql) => {
  const allowedPrefixes = ['SELECT', 'SHOW', 'EXPLAIN', 'WITH'];
  const firstWord = sql.trim().split(/\s+/)[0].toUpperCase();
  return allowedPrefixes.includes(firstWord);
};

export const executeQuery = async (req, res) => {
    const user_id = req.headers['x-user-id'];
    const { query } = req.body;

    if (!user_id || !query) {
      return res.status(400).json({ error: 'user_id and query are required' });
    }

    if (!isReadOnlyQuery(query)) {
        return res.status(403).json({ error: 'Only read-only queries are allowed.' });
    }

    try {
      await sequelize.authenticate();

      console.log('Connection to Neon DB established successfully.');

      const [result] = await sequelize.query(query);

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Query execution error:', error);
      return res.status(500).json({ error: 'Failed to execute query', details: error.message });
    }
  }