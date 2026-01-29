import bcrypt from 'bcryptjs';

const passwords = {
    'admin123': null,
    'manager123': null,
    'user123': null
};

console.log('Generating password hashes...\n');

for (const [password, _] of Object.entries(passwords)) {
    const hash = bcrypt.hashSync(password, 10);
    passwords[password] = hash;
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}\n`);
}

console.log('\nUpdate these hashes in server/database/schema.sql before importing the database.');
