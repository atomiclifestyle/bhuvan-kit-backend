import { Sequelize } from 'sequelize';
import User from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config()

const { NEON_API_KEY, NEON_PROJECT_ID, NEON_BRANCH_ID, NEON_HOST } = process.env;

const neonAPI = async (method, path, body = null) => {
  const url = `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}${path}`;
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NEON_API_KEY}`,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Neon API Error: ${errorData.message}`);
  }
  return response.json();
};


export const createUserDB = async (req, res) => {
  const user_id = req.headers['x-user-id'];

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in request' });
  }
  if (!NEON_API_KEY || !NEON_PROJECT_ID || !NEON_BRANCH_ID || !NEON_HOST) {
    console.error("Neon environment variables are not configured.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const dbName = `user_db_${user_id}`;
  const dbUser = `user_${user_id}`;

  try {
    const userProfile = await User.findOne({ user_id });
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found." });
    }
    
    if (userProfile.dbPassword) {
      return res.status(404).json({ error: "Database already exists" });
    }


    let dbPassword;

    try {
      // Attempt to create the role
      const roleResponse = await neonAPI('POST', `/branches/${NEON_BRANCH_ID}/roles`, {
        role: { name: dbUser },
      });
      dbPassword = roleResponse.role.password;
      console.log(`Role ${dbUser} created successfully.`);

    } catch (error) {
      // If the role already exists, reset its password to get a fresh one
      if (error.message.includes('already exists')) {
        console.log(`Role ${dbUser} already exists. Resetting password to resync.`);
        const resetResponse = await neonAPI('POST', `/branches/${NEON_BRANCH_ID}/roles/${dbUser}/reset_password`);
        dbPassword = resetResponse.role.password;
      } else {
        // Re-throw other errors
        throw error;
      }
    }

    // With a fresh password, update and save the user profile
    userProfile.dbPassword = dbPassword;
    await userProfile.save();
    console.log(`Password for ${dbUser} saved to application database.`);

    // Now, ensure the database exists (get or create)
    try {
      await neonAPI('POST', `/branches/${NEON_BRANCH_ID}/databases`, {
        database: { name: dbName, owner_name: dbUser },
      });
      console.log(`Database ${dbName} created successfully.`);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error; // Re-throw if it's not an "already exists" error
      }
      console.log(`Database ${dbName} already exists. Continuing.`);
    }

    res.status(201).json({
      message: `Database and user for ${user_id} are ready.`,
      host: NEON_HOST,
      database: dbName,
      user: dbUser,
    });

  } catch (err) {
    console.error('Final error in createUserDB:', err);
    res.status(500).json({ error: 'Failed to provision database resources', details: err.message });
  }
};



export const executeUserQuery = async (req, res) => {
  const user_id = req.headers['x-user-id']; 
  const { query } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in request' });
  }
  if (!query) {
    return res.status(400).json({ error: 'Request body must include query' });
  }

  try {
    const userProfile = await User.findOne({ user_id });
    if (!userProfile || !userProfile.dbPassword) {
        return res.status(404).json({ error: 'User database credentials not found. Please create the database first.' });
    }
    
    const password = userProfile.dbPassword.trim();
    const database = `user_db_${user_id}`;
    const user = `user_${user_id}`;

    const URI = `postgresql://${user}:${password}@${NEON_HOST}/${database}?sslmode=require&channel_binding=require`
    const userSequelize = new Sequelize(URI, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    await userSequelize.authenticate();
    const [result] = await userSequelize.query(query);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Query execution error:', error);
    return res.status(500).json({ error: 'Failed to execute query', details: error.message });
  }
};