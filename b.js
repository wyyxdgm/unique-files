const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, './storage/a.json');
const outputFilePath = path.join(__dirname, './storage/b.json');

function getDuplicateFiles(fileData) {
  const duplicates = {};

  fileData.forEach(file => {
    const key = `${file.name || file[0]}_${file.size || file[1]}`;
    if (!duplicates[key]) {
      duplicates[key] = [];
    }
    duplicates[key].push(file.path || file[0]);
  });

  return Object.values(duplicates).filter(files => files.length > 1);
}

const fileData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
const duplicateFiles = getDuplicateFiles(fileData);
fs.writeFileSync(outputFilePath, JSON.stringify(duplicateFiles, null, 2));