const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get token from the request header
  const authHeader = req.header('Authorization');

  // 2. Check if token exists
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 3. Verify the token
    // The header format is "Bearer <token>", so we split and get the second part
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Token format is invalid, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. If token is valid, add user to the request object
    req.user = decoded.user;
    next(); // Pass control to the next middleware (the actual route)
    
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};