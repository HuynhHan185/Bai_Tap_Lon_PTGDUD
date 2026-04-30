require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test MySQL connection
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    connection.release();

    app.listen(PORT, () => {
      console.log(`CamVang Backend running on http://localhost:${PORT}`);
      console.log(`API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    console.error('\nMake sure:');
    console.error('1. MySQL is running');
    console.error('2. Database "camvang" exists');
    console.error('3. .env file is configured correctly');
    process.exit(1);
  }
};

startServer();
