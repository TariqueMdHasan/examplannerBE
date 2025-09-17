const jwt = require('jsonwebtoken');

/**
 * Generate a JWT
 * @param {String} id - The user ID
 * @param {String} role - The user role ("superadmin", "admin", "user")
 * @param {String|null} impersonatedBy - If admin impersonates, pass admin ID
 */
const generateToken = (id, role, impersonatedBy = null) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const payload = { id, role };
        if (impersonatedBy) {
            payload.impersonatedBy = impersonatedBy;
        }

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    } catch (error) {
        console.error('Error during token generation:', error);
        throw new Error('Error during token generation');
    }
};

/**
 * Verify a JWT
 * @param {String} token - The token string
 */
const verifyToken = (token) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Error during token verification:', error);
        throw new Error('Not authorized to access this route');
    }
};

module.exports = { generateToken, verifyToken };
