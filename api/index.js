const serverless = require('serverless-http');
const { app } = require('../src/app');
const { connectDB } = require('../src/config/db');

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message
    });
  }

  return handler(req, res);
};
