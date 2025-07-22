import argon2 from 'argon2';
import { createUserSchema, User, userSchema } from '../db/schema';
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  updateUser,
  updateUserPassword,
} from '../services/user.service';
import { BackendError } from '../utils/errors';
import { createHandler } from '../utils/handler';
import generateToken from '../utils/jwt';

export const handleLogin = createHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user) {
    throw new BackendError('NOT_FOUND', {
      message: 'User not found',
    });
  }

  const matchPassword = await argon2.verify(user.password, password, {
    salt: Buffer.from(user.salt, 'hex'),
  } as any);

  if (!matchPassword) {
    throw new BackendError('INVALID_PASSWORD', {
      message: 'Invalid password',
    });
  }

  const token = generateToken(user.id);

  res.status(200).json({
    user: userSchema.parse(user),
    token,
  });
});

export const handleAddUser = createHandler(async (req, res) => {
  const user = req.body;

  const existingUser = await getUserByEmail(user.email);

  if (existingUser) {
    throw new BackendError('CONFLICT', {
      message: 'User already exists',
    });
  }

  const { newUser } = await createUser(user);

  res.status(201).json({
    user: createUserSchema.parse(newUser),
  });
});

export const handleGetUser = createHandler(async (_req, res) => {
  const { user } = res.locals as { user: User };

  if (!user) {
    throw new BackendError('NOT_FOUND', {
      message: 'User not found',
    });
  }

  try {
    res.status(200).json({
      user: userSchema.parse(user),
    });
  } catch (error) {
    throw new BackendError('INTERNAL_ERROR', {
      message: 'Internal server error',
    });
  }
});

export const handleUpdateUser = createHandler(async (req, res) => {
  const { user } = res.locals as { user: User };
  const { name, email, password } = req.body;

  const updatedUser = await updateUser(user.id, { name, email, password });

  res.status(200).json({
    user: userSchema.parse(updatedUser),
  });
});

/**
 * Function to delete a user
 *
 * @description Delete the authenticated user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const handleDeleteUser = createHandler(async (req, res) => {
  const { user } = res.locals as { user: User };

  const deletedUser = await deleteUser(user.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    user: userSchema.parse(deletedUser),
  });
});

/**
 * Function to update user password
 *
 * @description Update the password of the authenticated user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const handleUpdateUserPassword = createHandler(async (req, res) => {
  const { user } = res.locals as { user: User };
  const { newPassword, currentPassword } = req.body;

  // Vérifier l'ancien mot de passe
  const matchPassword = await argon2.verify(user.password, currentPassword, {
    salt: Buffer.from(user.salt, 'hex'),
  } as any);

  if (!matchPassword) {
    throw new BackendError('INVALID_PASSWORD', {
      message: 'Current password is incorrect',
    });
  }

  const updatedUser = await updateUserPassword(user.id, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    user: { id: updatedUser.id },
  });
});

/**
 * Function to get user by ID
 *
 * @description Get a specific user by ID (admin only)
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const handleGetUserById = createHandler(async (req, res) => {
  const { id } = req.params;
  const { user: currentUser } = res.locals as { user: User };

  // Vérifier si l'utilisateur actuel est admin ou demande ses propres infos
  if (currentUser.role !== 'admin' && currentUser.id !== id) {
    throw new BackendError('UNAUTHORIZED', {
      message: 'Access denied',
    });
  }

  const user = await getUserById(id);

  res.status(200).json({
    success: true,
    user: userSchema.parse(user),
  });
});
