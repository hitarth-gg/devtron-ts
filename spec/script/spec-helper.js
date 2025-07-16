const path = require('node:path');
const fs = require('node:fs').promises;

async function getSpecFiles(dir) {
  const filter = (file) => file.endsWith('-spec.ts');
  try {
    const files = await fs.readdir(dir);
    const testFiles = files.filter(filter).map((file) => path.join(dir, file));
    return testFiles;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

module.exports = {
  getSpecFiles,
};
