import mongoose, { Schema } from 'mongoose';

export const UserSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dbPassword: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);