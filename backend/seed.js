const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedDefaultUser = async () => {
  try {
    const defaultEmail = 'admin@example.com';
    const defaultPassword = 'password123';
    const user = await User.findOne({ where: { email: defaultEmail } });
    if (!user) {
      await User.create({
        email: defaultEmail,
        password: await bcrypt.hash(defaultPassword, 10),
      });
      console.log('Default user created: admin@example.com / password123');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedDefaultUser;