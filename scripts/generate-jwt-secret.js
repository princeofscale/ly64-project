#!/usr/bin/env node

/**
 * JWT Secret Generator
 * Generates a cryptographically secure random secret for JWT tokens
 */

const crypto = require('crypto');

console.log('========================================');
console.log('  JWT Secret Generator');
console.log('========================================');
console.log();

// Generate a 64-byte (512-bit) random secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret:');
console.log();
console.log(secret);
console.log();
console.log('Length:', secret.length, 'characters');
console.log('Entropy:', '512 bits');
console.log();
console.log('========================================');
console.log('  How to use:');
console.log('========================================');
console.log();
console.log('1. Copy the secret above');
console.log('2. Open backend/.env file');
console.log('3. Replace JWT_SECRET value with the generated secret:');
console.log();
console.log('   JWT_SECRET=' + secret);
console.log();
console.log('⚠️  WARNING: Keep this secret safe!');
console.log('   - Never commit it to git');
console.log('   - Never share it publicly');
console.log('   - Store it securely in production');
console.log('   - Rotate it every 90 days');
console.log();
console.log('✅  This secret is strong enough for production use');
console.log('========================================');
