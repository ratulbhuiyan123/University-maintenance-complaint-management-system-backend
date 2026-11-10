/**
 * Global Error Handling Middleware for Express & Prisma
 * Formats errors into short, clean, user-friendly messages for the UI/Toast
 */

const formatPrismaError = (err) => {
  const errName = err.name || '';
  const errCode = err.code || '';
  const errMsg = err.message || '';

  // 1. Supabase Paused / Tenant Not Found / Connection Timeout
  if (
    errMsg.includes('tenant/user') ||
    (errMsg.includes('not found') && errMsg.includes('tenant')) ||
    errMsg.includes('ENOTFOUND') ||
    errMsg.includes('ECONNREFUSED') ||
    errMsg.includes("Can't reach database server") ||
    errCode === 'P1001' ||
    errCode === 'P1002' ||
    errCode === 'P1017' ||
    errName === 'PrismaClientInitializationError'
  ) {
    return {
      statusCode: 503,
      status: 'error',
      errorType: 'DATABASE_PAUSED',
      message: 'Database is paused. Please resume it in Supabase.'
    };
  }

  // 2. Prisma P2002: Unique Constraint Violation (e.g. Email duplicate)
  if (errCode === 'P2002') {
    const target = err.meta && err.meta.target 
      ? (Array.isArray(err.meta.target) ? err.meta.target[0] : err.meta.target) 
      : 'Email';
    return {
      statusCode: 409,
      status: 'fail',
      errorType: 'DUPLICATE_ENTRY',
      message: `This ${target.toLowerCase()} is already registered.`
    };
  }

  // 3. Prisma P2025: Record Not Found
  if (errCode === 'P2025') {
    return {
      statusCode: 404,
      status: 'fail',
      errorType: 'NOT_FOUND',
      message: 'Requested record was not found.'
    };
  }

  // 4. Prisma P2003: Foreign Key Constraint Failure
  if (errCode === 'P2003') {
    return {
      statusCode: 400,
      status: 'fail',
      errorType: 'INVALID_REFERENCE',
      message: 'Invalid room or category selected.'
    };
  }

  // 5. Prisma P2000: Value Too Long
  if (errCode === 'P2000') {
    return {
      statusCode: 400,
      status: 'fail',
      errorType: 'VALUE_TOO_LONG',
      message: 'Input text is too long.'
    };
  }

  // 6. Prisma P2028: Transaction Error / Timeout
  if (errCode === 'P2028' || errMsg.includes('Transaction API error') || errMsg.includes('Transaction not found')) {
    return {
      statusCode: 500,
      status: 'error',
      errorType: 'TRANSACTION_TIMEOUT',
      message: 'Database busy. Please try again.'
    };
  }

  // 7. PrismaClientValidationError: Invalid Query Argument
  if (errName === 'PrismaClientValidationError') {
    return {
      statusCode: 400,
      status: 'fail',
      errorType: 'VALIDATION_ERROR',
      message: 'Invalid input data.'
    };
  }

  return null;
};

const formatJwtError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      status: 'fail',
      errorType: 'INVALID_TOKEN',
      message: 'Invalid session. Please login again.'
    };
  }
  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      status: 'fail',
      errorType: 'TOKEN_EXPIRED',
      message: 'Session expired. Please login again.'
    };
  }
  return null;
};

const globalErrorHandler = (err, req, res, next) => {
  // Check for Prisma errors
  const prismaFormatted = formatPrismaError(err);
  if (prismaFormatted) {
    return res.status(prismaFormatted.statusCode).json({
      status: prismaFormatted.status,
      errorType: prismaFormatted.errorType,
      message: prismaFormatted.message,
      ...(process.env.NODE_ENV === 'development' && {
        devDetail: err.message,
        errorCode: err.code
      })
    });
  }

  // Check for JWT errors
  const jwtFormatted = formatJwtError(err);
  if (jwtFormatted) {
    return res.status(jwtFormatted.statusCode).json({
      status: jwtFormatted.status,
      errorType: jwtFormatted.errorType,
      message: jwtFormatted.message
    });
  }

  // Standard or fallback
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const status = err.status || (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error');

  let message = err.message || 'Something went wrong. Please try again.';

  // Sanitize any raw database error
  if (message.includes('prisma') || message.includes('findUnique') || message.includes('querying the database')) {
    message = 'Database error. Please try again.';
  }

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      rawError: err.message
    })
  });
};

module.exports = globalErrorHandler;
