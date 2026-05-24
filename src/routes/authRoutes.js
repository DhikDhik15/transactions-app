const express = require('express');
const auth = require('../middleware/auth');
const {
  login,
  profile,
  register,
  updateProfile,
  updateProfileImage,
} = require('../controllers/authController');

const router = express.Router();
const rawMultipart = express.raw({
  type: (req) => (req.headers['content-type'] || '').includes('multipart/form-data'),
  limit: '2mb',
});

router.post('/registration', register);
router.post('/login', login);
router.get('/profile', auth, profile);
router.put('/profile/update', auth, updateProfile);
router.put('/profile/image', auth, rawMultipart, updateProfileImage);

module.exports = router;
