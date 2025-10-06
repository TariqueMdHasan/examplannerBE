const User = require('../model/user.js')
const {generateToken} = require('../utils/token.js')
const bcrypt = require('bcrypt');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register for role user
const registerUser = async (req, res) => {  
    const { userName, email, password, name } = req.body;

    if (!userName || !email || !password || !name) {
        return res.status(400).json({ message: 'Please enter all data' });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {   
        // 🚫 role is ignored here, always "user"
        const user = await User.create({ userName, email, password, name, role: "user" });
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token
        });

    } catch (error) {
        if (error.code === 11000) {
            const duplicateKey = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `${duplicateKey} already exists` });
        }
        console.error('Error during user registration', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// register for role admin
// const registerAdmin = async (req, res) => {  
//     const { userName, email, password, name } = req.body;

//     if (!userName || !email || !password || !name) {
//         return res.status(400).json({ message: 'Please enter all data' });
//     }

//     try {
//         // ✅ Ensure only admins can create admins
//         if (!req.user || req.user.role !== "admin") {
//             return res.status(403).json({ message: "Not authorized to create admin" });
//         }

//         const existUser = await User.findOne({ email });
//         if (existUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const user = await User.create({ userName, email, password, name, role: "admin" });
//         const token = generateToken(user._id);

//         res.status(201).json({
//             message: 'Admin created successfully',
//             user: {
//                 id: user._id,
//                 userName: user.userName,
//                 email: user.email,
//                 name: user.name,
//                 role: user.role,
//             },
//             token
//         });

//     } catch (error) {
//         console.error('Error during admin registration', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// only super admin can create admin
const registerAdmin = async (req, res) => {  
    const { userName, email, password, name } = req.body;

    if (!userName || !email || !password || !name) {
        return res.status(400).json({ message: 'Please enter all data' });
    }

    try {
        // ✅ Only superadmin can create admins
        if (!req.user || req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Only superadmin can create admins" });
        }

        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ userName, email, password, name, role: "admin" });
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Admin created successfully',
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token
        });

    } catch (error) {
        console.error('Error during admin registration', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Google login
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // token from frontend (Google OAuth response)

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        userName: name.replace(/\s+/g, "_"),
        email,
        password: sub + "Aa@1", // dummy password
        name,
        role: "user",
      });
    }

    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      message: "Google login successful",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Error in Google login", error);
    res.status(500).json({ message: "Google login failed" });
  }
};


// login anyone
const loginUser = async (req, res) => {
    const { email, password, userName } = req.body;

    if ((!email && !userName) || !password) {
        return res.status(400).json({ message: "Please enter email/username and password" });
    }

    try {
        const user = await User.findOne({
            $or: [{ email }, { userName }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error in authController" });
    }
};

// admin loggin in in user id by just email or username
const impersonateUser = async (req, res) => {
    const { email, userName } = req.body;

    if (!email && !userName) {
        return res.status(400).json({ message: "Please enter email or username of the user" });
    }

    try {
        // Ensure the requester is an admin
        if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Find target user
        const targetUser = await User.findOne({
            $or: [{ email }, { userName }]
        });

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate token as if the user logged in
        const token = generateToken(targetUser._id);

        return res.status(200).json({
            message: `Admin logged in as ${targetUser.userName}`,
            user: {
                _id: targetUser._id,
                userName: targetUser.userName,
                email: targetUser.email,
                name: targetUser.name,
                role: targetUser.role,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error in impersonation" });
    }
};

// update by superadmin → admin → user
const updateUser = async (req, res) => {
  const { userName, email, password, name, currentPassword } = req.body;
  const { id: targetUserId } = req.params;

  try {
    // If admin or superadmin → can update any user (by params)
    // Else → can only update self
    const isPrivileged = ["admin", "superadmin"].includes(req.user.role);
    const userIdToUpdate = isPrivileged && targetUserId ? targetUserId : req.user._id;

    const user = await User.findById(userIdToUpdate).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Prevent modifying superadmin by others
    if (user.role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "You cannot modify the superadmin" });
    }

    // If normal user updating sensitive fields → must provide current password
    if (
      !isPrivileged &&
      (email || userName || password) &&
      !currentPassword
    ) {
      return res.status(400).json({ message: "Please provide your current password to update sensitive fields" });
    }

    if (
      !isPrivileged &&
      currentPassword &&
      !(await bcrypt.compare(currentPassword, user.password))
    ) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update fields
    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (name) user.name = name;
    if (password) user.password = password; // will be hashed by pre-save hook

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error while updating user", error);
    res.status(500).json({ message: "Server error while updating user" });
  }
};


// delete superadmin → admin → user
const deleteUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const isPrivileged = ["admin", "superadmin"].includes(req.user.role);

    // If admin/superadmin → can delete any user
    // Else → can delete only self
    const userIdToDelete = isPrivileged && targetUserId ? targetUserId : req.user._id;

    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Protect superadmin from deletion
    if (user.role === "superadmin") {
      return res.status(403).json({ message: "Superadmin cannot be deleted" });
    }

    // 🚫 Prevent users from deleting others
    if (!isPrivileged && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }

    await User.findByIdAndDelete(userIdToDelete);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error during user deletion", error);
    res.status(500).json({ message: "Error while deleting user" });
  }
};


//  get user data superadmin → admin → user
const getUserData = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const isPrivileged = ["admin", "superadmin"].includes(req.user.role);

    // If admin/superadmin → can fetch any user by ID
    // Else → only own data
    const userIdToFetch = isPrivileged && targetUserId ? targetUserId : req.user._id;

    const user = await User.findById(userIdToFetch).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User data retrieved successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error finding user data", error);
    res.status(500).json({ message: "Error while getting user data" });
  }
};


// admin and super admin can get all user data
const getAllUsers = async (req, res) => {
    try {
        // Ensure only admin can access this
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Not authorized to view all users" });
        }

        const users = await User.find().select("-password"); // exclude passwords

        return res.status(200).json({
            message: "All users retrieved successfully",
            users,
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Server error while fetching users" });
    }
};



// Pause/unpause user
const togglePauseUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isPaused = !user.isPaused;
        await user.save();

        res.json({ message: `User ${user.isPaused ? 'paused' : 'unpaused'} successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Change role of user/admin
const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body; // new role
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent downgrade/upgrade incorrectly (optional check)
        if (user.role === 'superadmin') {
            return res.status(403).json({ message: "Cannot change role of superadmin" });
        }

        user.role = role;
        await user.save();

        res.json({ message: "User role updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



module.exports = { registerUser, loginUser, updateUser, deleteUser, 
    getUserData, getAllUsers, impersonateUser, registerAdmin,
    togglePauseUser, changeUserRole, googleLogin }