import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token and return decoded payload
 * @param {Request} request - Next.js request object
 * @returns {{ userId: string, username: string, role: string } | null}
 */
export function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 * @param {Request} request
 * @returns {{ isAuthenticated: boolean, user: object | null, error: object | null }}
 */
export function checkAuth(request) {
  const decoded = verifyToken(request);

  if (!decoded) {
    return {
      isAuthenticated: false,
      user: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    };
  }

  return {
    isAuthenticated: true,
    user: decoded,
    error: null,
  };
}

/**
 * Check if user has admin role
 * @param {Request} request
 * @returns {{ isAdmin: boolean, user: object | null, error: object | null }}
 */
export function checkAdmin(request) {
  const { isAuthenticated, user, error } = checkAuth(request);

  if (!isAuthenticated) {
    return { isAdmin: false, user: null, error };
  }

  if (user.role !== 'ADMIN') {
    return {
      isAdmin: false,
      user,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    };
  }

  return { isAdmin: true, user, error: null };
}
