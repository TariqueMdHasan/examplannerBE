// controllers/todo.controller.js
const Todo = require("../model/todoModel.js");

// ✅ Add single todo
const addTodo = async (req, res) => {
  const { subject, task, status, scheduledIn, date } = req.body;

  try {
    const newTodo = new Todo({
      user: req.user._id, // attach logged in user
      subject,
      task,
      status,
      scheduledIn,
      date,
    });

    await newTodo.save();
    res.status(201).json({
      message: "Todo created successfully",
      todo: newTodo,
    });
  } catch (error) {
    console.error("error in addTodo", error);
    res.status(500).json({ message: "Error in addTodo" });
  }
};

// ✅ Get todos
const getTodo = async (req, res) => {
  try {
    let todos;

    if (req.user.role === "user") {
      // only own tasks
      todos = await Todo.find({ user: req.user._id })
        .populate("subject", "name")
        .populate("user", "name email");
    } else {
      // admin/superadmin -> all tasks
      todos = await Todo.find()
        .populate("subject", "name")
        .populate("user", "name email");
    }

    return res.status(200).json({
      message: "Todos fetched successfully",
      totalTasks: todos.length,
      todos,
    });
  } catch (error) {
    console.error("not able to get todo list", error);
    res.status(500).json({ message: "not able to get todo list" });
  }
};

// ✅ Delete todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role === "user" && todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this task" });
    }

    await todo.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("deletion failed", error);
    res.status(500).json({ message: "deletion failed" });
  }
};

// ✅ Update todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, task, status, scheduledIn, date } = req.body;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role === "user" && todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to update this task" });
    }

    todo.status = status || todo.status;
    todo.date = date || todo.date;
    todo.scheduledIn = scheduledIn || todo.scheduledIn;
    todo.subject = subject || todo.subject;
    todo.task = task || todo.task;

    const updatedTodo = await todo.save();
    return res.status(200).json({
      message: "Task updated successfully",
      todo: updatedTodo,
    });
  } catch (error) {
    console.error("task not able to update", error);
    res.status(500).json({ message: "task not able to update" });
  }
};

// ✅ Add bulk todos
const addBulkTodos = async (req, res) => {
  try {
    const { tasks } = req.body; // expecting { tasks: [ {...}, {...} ] }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: "No tasks provided" });
    }

    // attach userId to all
    const tasksWithUser = tasks.map((task) => ({
      ...task,
      user: req.user._id,
    }));

    const newTodos = await Todo.insertMany(tasksWithUser);

    res.status(201).json({
      message: "Bulk tasks added successfully",
      count: newTodos.length,
      todos: newTodos,
    });
  } catch (error) {
    console.error("Error in addBulkTodos:", error);
    res.status(500).json({ message: "Error in adding bulk todos" });
  }
};

module.exports = { addTodo, getTodo, deleteTodo, updateTodo, addBulkTodos };










