// Student Controller
class StudentController {
  static async index(req, res) {
    try {
      res.json({ message: 'Student endpoint working' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // TODO: Add specific methods for student
}

module.exports = StudentController;