const { getUsers } = require('../utils/storage');

function login(req, res) {
  const { email, password } = req.body;
  const users = getUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({
    message: 'Login successful!',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

module.exports = { login };
