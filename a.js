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

  let result = [];

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      result.push(getFileStats(filePath));
    } else if (stats.isDirectory()) {
      result = result.concat(getAllFiles(filePath)); // 递归处理子文件夹
    }
  });

  return result;
}


const filesData = getAllFiles(folderPath);
fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));