import { Router } from 'express';
import {
  handleAddUser,
  handleGetUser,
  handleLogin,
} from '../../controllers/user.controller';
import { authenticate } from '../../middleware/auth';

export default (router: Router) => {
  /**
   * @openapi
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *         name:
   *           type: string
   *         email:
   *           type: string
   *         phone:
   *           type: string
   *         imageUrl:
   *           type: string
   *         birthDate:
   *           type: string
   *           format: date
   *         isAdmin:
   *           type: boolean
   *         isVerified:
   *           type: boolean
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *       required:
   *         - id
   *         - name
   *         - email
   *         - phone
   *         - isAdmin
   *         - isVerified
   *         - createdAt
   *         - updatedAt
   * /me:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - User
   *     summary: Get authenticated user informations
   *     description: Get authenticated user informations
   *     responses:
   *       200:
   *         description: User retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   */
  router.get('/me', authenticate(), handleGetUser);

  /**
   * @openapi
   * components:
   *   schemas:
   *     Login:
   *       type: object
   *       properties:
   *         email:
   *           type: string
   *         password:
   *           type: string
   *       required:
   *         - email
   *         - password
   * /login:
   *   post:
   *     tags:
   *       - User
   *     summary: Login
   *     description: Login
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Login'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   */
  router.post('/login', handleLogin);

  /**
   * @openapi
   * components:
   *   schemas:
   *     Register:
   *       type: object
   *       properties:
   *         name:
   *           type: string
   *         email:
   *           type: string
   *         password:
   *           type: string
   *         phone:
   *           type: string
   *         birthDate:
   *           type: string
   *           format: date
   *       required:
   *         - name
   *         - email
   *         - password
   *         - phone
   *         - birthDate
   * /register:
   *   post:
   *     summary: Register
   *     description: Register
   *     tags:
   *       - User
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Register'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad Request
   *       409:
   *         description: User already exists
   *       500:
   *         description: Internal Server Error
   */
  router.post('/register', handleAddUser);
};
