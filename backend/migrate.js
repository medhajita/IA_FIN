require('dotenv').config();
const { sequelize } = require('./models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    await sequelize.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS last_name  VARCHAR(100),
        ADD COLUMN IF NOT EXISTS phone      VARCHAR(20);
    `);
    console.log('Added first_name, last_name, phone columns');

    // Migrate existing name → first_name (put full name in first_name, last_name = '')
    await sequelize.query(`
      UPDATE users
        SET first_name = COALESCE(name, 'User'),
            last_name  = ''
        WHERE first_name IS NULL;
    `);
    console.log('Migrated existing name data');

    await sequelize.query(`
      ALTER TABLE users
        ALTER COLUMN first_name SET NOT NULL,
        ALTER COLUMN last_name  SET NOT NULL;
    `);
    console.log('Set NOT NULL constraints');

    await sequelize.query(`ALTER TABLE users DROP COLUMN IF EXISTS name;`);
    console.log('Dropped old name column');

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
