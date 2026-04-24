require('dotenv').config();
const { app } = require('./src/app');
const { connectDB } = require('./src/config/db');

connectDB()
  .then(() => {
    console.log('MongoDB connected');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => console.log(err));