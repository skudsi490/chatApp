const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found at ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
      status: 'error',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🚫' : err.stack,
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
