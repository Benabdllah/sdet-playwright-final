const { execSync } = require('child_process');

console.log('🔒 Pre-Install Check gestartet...');

// 1. Registry auf HTTPS setzen
execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });

// 2. npm doctor laufen lassen
execSync('npm doctor', { stdio: 'inherit' });

// 3. Audit Fix versuchen
execSync('npm audit fix --force', { stdio: 'inherit' });

// 4. npm Cache überprüfen
execSync('npm cache verify', { stdio: 'inherit' });

console.log('✅ Pre-Install Check abgeschlossen.');
