const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const saltRounds = 12; // Same as your app default
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  const password = 'Abc@1234';
  
  try {
    const hashedPassword = await hashPassword(password);
    
    console.log('='.repeat(60));
    console.log('PASSWORD HASHING RESULT');
    console.log('='.repeat(60));
    console.log('Original Password:', password);
    console.log('Hashed Password: ', hashedPassword);
    console.log('='.repeat(60));
    console.log('SQL UPDATE QUERY:');
    console.log('='.repeat(60));
    console.log(`UPDATE user SET password = '${hashedPassword}' WHERE email = 'mocsoft@gmail.com';`);
    console.log('='.repeat(60));
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Hash Verification:', isValid ? '✅ VALID' : '❌ INVALID');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

main();