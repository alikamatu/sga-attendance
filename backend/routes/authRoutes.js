const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

module.exports = router;