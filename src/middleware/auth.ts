import { getUserById } from '../services/user.service';
import { BackendError } from '../utils/errors';
import { createHandler } from '../utils/handler';
import { verifyToken } from '../utils/jwt';

export function authenticate(
  { verifyAdmin } = {
    verifyAdmin: false,
  },
) {
  return createHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new BackendError('UNAUTHORIZED', {
        message: 'Authorization header not found',
      });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      throw new BackendError('UNAUTHORIZED', {
        message: 'Token not found',
      });
    }

    const { userId } = verifyToken(token);

    const user = await getUserById(userId);

    /* if (!user) throw new BackendError('USER_NOT_FOUND');

    if (!user.isVerified) {
      throw new BackendError('UNAUTHORIZED', {
        message: 'User not verified',
      });
    }

    if (verifyAdmin && user.role !== 'admin') {
      throw new BackendError('UNAUTHORIZED', {
        message: 'User not authorized',
      });
    } */

    res.locals.user = user;
    next();
  });
}
