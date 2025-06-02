// Auth Controller
class AuthController {
  static async index(req, res) {
    try {
      res.json({ message: 'Auth endpoint working' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // TODO: Add specific methods for auth
}

module.exports = AuthController;