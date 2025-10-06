const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserData,
  getAllUsers,
  impersonateUser,
  registerAdmin,
  togglePauseUser, 
  changeUserRole,
  googleLogin
} = require("../controller/authController.js");


const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware.js");
const checkRole = require('../middleware/checkRole.js')

// ✅ Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);


// ✅ Only superadmin can create admins
router.post("/admin/register", authMiddleware, authorizeRoles("superadmin"), registerAdmin);

// ✅ Private routes
router.get("/me", authMiddleware, getUserData);
router.put("/me", authMiddleware, updateUser);
router.delete("/me", authMiddleware, deleteUser);

// Pause/unpause user (admin can do it for users, superadmin can do it for anyone)
router.put('/pause/:id', authMiddleware, checkRole('admin', 'superadmin'), togglePauseUser);

// Change role (only superadmin can change role of admins/users)
router.put('/role/:id', authMiddleware, checkRole('superadmin'), changeUserRole);

// ✅ Admin & superadmin routes
router.get("/all", authMiddleware, authorizeRoles("admin", "superadmin"), getAllUsers);
router.get("/admin/:id", authMiddleware, authorizeRoles("admin", "superadmin"), getUserData);
router.put("/admin/:id", authMiddleware, authorizeRoles("admin", "superadmin"), updateUser);
router.delete("/admin/:id", authMiddleware, authorizeRoles("admin", "superadmin"), deleteUser);
router.post("/impersonate", authMiddleware, authorizeRoles("admin", "superadmin"), impersonateUser);


module.exports = router;
