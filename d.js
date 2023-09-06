const fs = require('fs');

const inputFilePath = 'c.json';

const filesToRemove = JSON.parse(fs.readFileSync(inputFilePath, 'utf8')).flat();
filesToRemove.forEach(filePath => {
  fs.unlinkSync(filePath);
});