import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import { db } from '../db';
import { NewUser, users } from '../db/schema';
import { BackendError } from '../utils/errors';
// sha256 helpers are no longer required in this service

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new BackendError('NOT_FOUND', {
      message: 'User not found',
    });
  }

  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

export async function createUser(user: NewUser) {
  const { password, ...rest } = user;

  // Hash the password
  const salt = crypto.randomBytes(32);
  const hashedPassword = await argon2.hash(password, {
    salt,
  });

  // Create the user
  const [newUser] = await db
    .insert(users)
    .values({
      ...rest,
      password: hashedPassword,
      salt: salt.toString('hex'),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isVerified: users.isVerified,
      password: users.password,
      salt: users.salt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!newUser) {
    throw new BackendError('INTERNAL_ERROR', {
      message: 'Failed to add user',
    });
  }

  return { newUser };
}

// The email verification logic has been temporarily removed as the users table
// no longer stores a verification code. To re-introduce this feature, add the
// appropriate column to the schema and update the service accordingly.

export async function deleteUser(userId: string) {
  const user = await getUserById(userId);

  if (!user) {
    throw new BackendError('NOT_FOUND', {
      message: 'User not found',
    });
  }

  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return deletedUser;
}

export async function updateUser(userId: string, user: Partial<NewUser>) {
  const [updatedUser] = await db
    .update(users)
    .set(user)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!updatedUser) {
    throw new BackendError('INTERNAL_ERROR', {
      message: 'Failed to update user',
    });
  }
  return updatedUser;
}

export async function updateUserPassword(userId: string, password: string) {
  const user = await getUserById(userId);

  if (!user) {
    throw new BackendError('NOT_FOUND', {
      message: 'User not found',
    });
  }

  // Hash the password
  const salt = crypto.randomBytes(32);
  const hashedPassword = await argon2.hash(password, {
    salt,
  });

  // Update the user
  const [updatedUser] = await db
    .update(users)
    .set({ password: hashedPassword, salt: salt.toString('hex') })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!updatedUser) {
    throw new BackendError('INTERNAL_ERROR', {
      message: 'Failed to update user password',
    });
  }

  return updatedUser;
}
