const fs = require('fs');
const path = require('path');

const folderPath = './folder';
const outputFilePath = 'a.json';

function getFileStats(filePath) {
  const stats = fs.statSync(filePath);
  return {
    path: filePath,
    size: stats.size
  };
}

function getAllFiles(folderPath) {
  const files = fs.readdirSync(folderPath);

  const result = files.map(file => {
    const filePath = path.resolve(folderPath, file);
    if (fs.statSync(filePath).isFile()) {
      return getFileStats(filePath);
    }
  });

  return result.filter(file => file !== undefined);
}

const filesData = getAllFiles(folderPath);
fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));