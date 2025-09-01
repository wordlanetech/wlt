const bcrypt = require('bcrypt');

(async () => {
    const hash = await bcrypt.hash('password', 12);
    console.log(hash); // Copy the **full hash** (60 chars)
})();
