module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB_URI || 'mongodb://localhost:27017/database',
  secret: process.env.SECRET || 'grjg3524asdw24sfq93'
};
