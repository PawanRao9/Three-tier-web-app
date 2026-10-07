const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { validateUserRegistration, registerLoginValidation, validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @api {post} /api/users/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Auth
 * @apiBody {String} name User's full name (required)
 * @apiBody {String} email User's email (required, must be valid)
 * @apiBody {String} password User's password (min 6 chars, must contain letter+number)
 * @apiBody {String} [role="user"] User role: "admin" or "user"
 */
router.post(
  '/register',
  validateUserRegistration,
  validate,
  userController.register
);

/**
 * @api {post} /api/users/login Login user
 * @apiName LoginUser
 * @apiGroup Auth
 * @apiBody {String} email User's email (required)
 * @apiBody {String} password User's password (required)
 */
router.post(
  '/login',
  registerLoginValidation,
  validate,
  userController.login
);

/**
 * @api {get} /api/users/profile Get logged-in user profile
 * @apiName GetProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 */
router.get('/profile', authMiddleware.protect, userController.getProfile);

/**
 * @api {put} /api/users/profile Update logged-in user profile
 * @apiName UpdateProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 * @apiBody {String} [name] Updated name
 * @apiBody {String} [email] Updated email
 */
router.put(
  '/profile',
  authMiddleware.protect,
  [body('name').optional().trim().isLength({ max: 50 }), body('email').optional().isEmail().normalizeEmail()],
  validate,
  userController.updateProfile
);

/**
 * @api {get} /api/users Get all users (Admin only)
 * @apiName GetAllUsers
 * @apiGroup Admin
 * @apiHeader {String} Authorization Bearer token (Admin)
 * @apiQuery {Number} page Page number (default: 1)
 * @apiQuery {Number} limit Results per page (default: 10)
 */
router.get('/', authMiddleware.protect, authorize('admin'), userController.getAllUsers);

/**
 * @api {delete} /api/users/:id Delete a user (Admin only)
 * @apiName DeleteUser
 * @apiGroup Admin
 * @apiParam {String} id User ID
 */
router.delete('/:id', authMiddleware.protect, authorize('admin'), userController.deleteUser);

module.exports = router;
