const fs = require('fs');

const inputFilePath = './storage/a.json';
const outputFilePath = './storage/b.json';

function getDuplicateFiles(fileData) {
  const duplicates = {};

  fileData.forEach(file => {
    const key = `${file.name}_${file.size}`;
    if (!duplicates[key]) {
      duplicates[key] = [];
    }
    duplicates[key].push(file.path);
  });

  return Object.values(duplicates).filter(files => files.length > 1);
}

const fileData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
const duplicateFiles = getDuplicateFiles(fileData);
fs.writeFileSync(outputFilePath, JSON.stringify(duplicateFiles, null, 2));