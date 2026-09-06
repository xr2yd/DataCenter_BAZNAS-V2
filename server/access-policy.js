export const ROLE = Object.freeze({ ADMIN: 'admin', PENYALURAN: 'penyaluran', SURVEYOR: 'surveyor' });

const permissions = Object.freeze({
  'master-data:write': [ROLE.ADMIN],
  'mustahik:read': [ROLE.ADMIN, ROLE.PENYALURAN, ROLE.SURVEYOR],
  'mustahik:write': [ROLE.ADMIN, ROLE.PENYALURAN],
  'mustahik:decision': [ROLE.ADMIN, ROLE.PENYALURAN, ROLE.SURVEYOR],
  'assessment:write': [ROLE.ADMIN, ROLE.PENYALURAN, ROLE.SURVEYOR],
  'mpzis:write': [ROLE.ADMIN, ROLE.PENYALURAN],
  'ppd:write': [ROLE.ADMIN, ROLE.PENYALURAN],
  'document:write': [ROLE.ADMIN, ROLE.PENYALURAN, ROLE.SURVEYOR],
  'laporan:export': [ROLE.ADMIN, ROLE.PENYALURAN],
  'audit:read': [ROLE.ADMIN],
});

const REPOSITORY_DEFAULT_JWT_SECRET = 'baznas_tangkot_super_secret_jwt_key_2026';
const EXAMPLE_JWT_SECRET = 'change-me-in-production';
const DEVELOPMENT_JWT_SECRET = 'development-only-jwt-secret';

export function canAccess(role, permission) {
  return Boolean(role && permissions[permission]?.includes(role));
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
  }
  return next();
}

export function requireAnyRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return requireAuth(req, res, next);
    }
    if (req.user.role === ROLE.ADMIN || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Akses dibatasi. Fitur ini memerlukan hak akses divisi: ${allowedRoles.join(', ')}`
    });
  };
}

export function requireProductionSecret({ jwtSecret = process.env.JWT_SECRET, nodeEnv = process.env.NODE_ENV } = {}) {
  const isUnsafeSecret = !jwtSecret ||
    jwtSecret === REPOSITORY_DEFAULT_JWT_SECRET ||
    jwtSecret === EXAMPLE_JWT_SECRET ||
    jwtSecret === DEVELOPMENT_JWT_SECRET;

  if (nodeEnv === 'production' && isUnsafeSecret) {
    throw new Error('JWT_SECRET must be set to a non-example secret in production.');
  }

  return jwtSecret || DEVELOPMENT_JWT_SECRET;
}
