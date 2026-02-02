#!/usr/bin/env node
/**
 * Script to automatically fix no-floating-promises ESLint errors
 * by adding void operator before promise calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get ESLint results in JSON format
console.log('Running ESLint to find floating promises...');
const eslintOutput = execSync('npx eslint frontend/src --ext ts,tsx --format json', {
  encoding: 'utf-8',
  cwd: __dirname + '/..',
}).toString();

const results = JSON.parse(eslintOutput);
const fixes = new Map();

// Collect all no-floating-promises errors
results.forEach(result => {
  const floatingPromises = result.messages.filter(
    msg => msg.ruleId === '@typescript-eslint/no-floating-promises'
  );

  if (floatingPromises.length > 0) {
    fixes.set(result.filePath, floatingPromises);
  }
});

console.log(`Found ${fixes.size} files with floating promises`);

// Fix each file
fixes.forEach((errors, filePath) => {
  console.log(`Fixing ${path.basename(filePath)}...`);
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Sort errors by line number in reverse to avoid offset issues
  errors.sort((a, b) => b.line - a.line);

  errors.forEach(error => {
    const lineIndex = error.line - 1;
    const line = lines[lineIndex];
    const column = error.column - 1;

    // Find the start of the promise call
    const beforePromise = line.substring(0, column);
    const afterPromise = line.substring(column);

    // Check if already has void operator
    if (beforePromise.trimEnd().endsWith('void')) {
      return;
    }

    // Add void operator
    const indent = beforePromise.match(/^\s*/)[0];
    lines[lineIndex] = beforePromise.trimEnd() + ' void' + afterPromise;
  });

  const fixedContent = lines.join('\n');
  fs.writeFileSync(filePath, fixedContent, 'utf-8');
  console.log(`  Fixed ${errors.length} issues`);
});

console.log('Done!');
