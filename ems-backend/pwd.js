// Install bcrypt if not already:
// npm install bcrypt

const bcrypt = require('bcrypt');

const password = 'password'; // raw password
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
