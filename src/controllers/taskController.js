import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      owner: req.user._id,
    });

    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ownership check
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.deleteOne();
    return res.json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};