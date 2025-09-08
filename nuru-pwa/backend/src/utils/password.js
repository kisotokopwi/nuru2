import bcrypt from 'bcryptjs';

const MIN_SALT_ROUNDS = 12;

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(MIN_SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

