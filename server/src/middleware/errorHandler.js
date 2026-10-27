/**
 * Global error-handling middleware.
 * Must be registered LAST in Express (4 parameters).
 */
export function errorHandler(err, req, res, _next) {
    const status = err.status || err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production' && status === 500
            ? 'Internal Server Error'
            : err.message || 'Something went wrong';

    console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

    res.status(status).json({ error: message });
}
