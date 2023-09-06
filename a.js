const fs = require('fs');
const path = require('path');

const folderPath = './folder';
const outputFilePath = 'a.json';
const delayInSeconds = 3; // 设置延迟的秒数

function getFileStats(filePath) {
  const stats = fs.statSync(filePath);
  return {
    path: filePath,
    size: stats.size
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readFilesInFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      const fileDataPromises = [];
      for (let file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.isDirectory()) {
          console.log(`delay ${delayInSeconds}s for folderPath: ${filePath}`);
          await delay(delayInSeconds * 1000);
          fileDataPromises.push(readFilesInFolder(filePath));
        }
        fileDataPromises.push(getFileStats(filePath));
      }

      Promise.all(fileDataPromises)
        .then(result => resolve(result.flat()))
        .catch(reject);
    });
  });
}


readFilesInFolder(folderPath)
  .then(filesData => {
    fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
    console.log(`File data saved to ${outputFilePath}`);
  })
  .catch(err => {
    console.error(err);
  });