const JWT = require('jsonwebtoken');
const createError = require('http-errors');

const signAccessToken = (userId, userEmail, role) => {
  return new Promise((resolve, reject) => {
    const payload = {
      id: userId,
      email: userEmail,
      role: role
    };

    const secret = process.env.SECRETKEY;
    const options = {
      expiresIn: '1d',
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        return reject(createError.InternalServerError());
      }
      resolve({ access_token: token});
    });
  })
}

const verifyAccessToken = async (req, res, next) => {
  if (!req.headers || !req.headers['authorization']) return next(createError.Unauthorized());

  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[1]
  JWT.verify(token, process.env.SECRETKEY, (err, payload) => {
    if (err) {
      console.log(err);
      return next(createError.Unauthorized());
    }

    req.payload = payload;
    next();
  });
}

const generateEmailVerificationToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { user_id: userId };
    const secret = process.env.EMAIL_VERIFICATION_SECRET;
    const options = {
      expiresIn: '30m',
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        return resolve(err);
      }
      resolve(token);
    });
  })
}

const verifyEmailToken = (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.EMAIL_VERIFICATION_SECRET;
    JWT.verify(token, secret, (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return resolve({ valid: false, error: 'Token has expired.' });
        } else {
          return resolve({ valid: false, error: 'Token is invalid.' });
        }
      } else {
        resolve({ valid: true, payload: payload });
      }
    });
  });
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateEmailVerificationToken,
  verifyEmailToken,
}
