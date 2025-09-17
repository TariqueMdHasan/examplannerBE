// routes/todo.routes.js
const express = require("express");
const {
  addTodo,
  getTodo,
  deleteTodo,
  updateTodo,
  addBulkTodos,
} = require("../controller/todoController.js");
const { authMiddleware } = require("../middleware/authMiddleware.js"); // ✅ import your JWT auth

const router = express.Router();

router.post("/", authMiddleware, addTodo);
router.get("/", authMiddleware, getTodo);
router.post("/bulk", authMiddleware, addBulkTodos);
router.delete("/delete/:id", authMiddleware, deleteTodo);
router.put("/update/:id", authMiddleware, updateTodo);

module.exports = router;
