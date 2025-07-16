import User from "../models/User";

const checkUserId = async (req, res, next) => {
  try {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('Error checking user_id:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export default checkUserId;
