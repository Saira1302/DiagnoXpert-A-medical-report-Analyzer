const mongoose = require('mongoose');

async function DbConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  await mongoose.connect(MONGODB_URI);
}

export default DbConnection;