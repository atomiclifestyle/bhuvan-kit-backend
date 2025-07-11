import { Sequelize } from 'sequelize';

const adminSequelize = new Sequelize('postgres', 'admin', 'secret', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log,
});

export const createUserDB = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in body' });
  }

  const dbName = `user_db_${user_id}`;
  const dbUser = `user${user_id}`;
  const dbPassword = `pass${user_id}`;

  try {
    await adminSequelize.authenticate();

    // 1. Create database
    await adminSequelize.query(`CREATE DATABASE "${dbName}";`);

    // 2. Create user
    await adminSequelize.query(`CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}';`);

    // 3. Grant privileges
    await adminSequelize.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}";`);

    res.status(201).json({
      message: `Database ${dbName} and user ${dbUser} created.`,
      db: dbName,
      user: dbUser,
      password: dbPassword,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

  export const executeUserQuery = async (req, res) => {
    const { user_id } = req.params;
    const { query } = req.body;

    if (!user_id || !query) {
      return res.status(400).json({ error: 'user_id and query are required' });
    }

    const dbName = `user_db_${user_id}`;
    const dbUser = `user${user_id}`;
    const dbPassword = `pass${user_id}`;

    const userSequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: console.log,
    });

    try {
      await userSequelize.authenticate();

      const [result] = await userSequelize.query(query);

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Query execution error:', error);
      return res.status(500).json({ error: 'Failed to execute query', details: error.message });
    } finally {
      await userSequelize.close();
    }
  }