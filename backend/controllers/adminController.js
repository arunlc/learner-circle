// Admin Controller
class AdminController {
  static async index(req, res) {
    try {
      res.json({ message: 'Admin endpoint working' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // TODO: Add specific methods for admin
}

module.exports = AdminController;