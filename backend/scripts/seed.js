const User = require('./models/User');
const { hashPassword } = require('./config/auth');
const { sequelize } = require('./config/database');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: false });

    const existingUser = await User.findOne({ where: { username: 'admin' } });

    if (!existingUser) {
      const hashedPassword = await hashPassword('admin123');
      await User.create({
        username: 'admin',
        email: 'admin@ichhya.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('⏭️ Admin user already exists');
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

seedDatabase().then(() => process.exit(0));
