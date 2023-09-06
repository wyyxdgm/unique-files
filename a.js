const fs = require('fs');
const path = require('path');

// const folderPath = '/Volumes/dav_damo/baiduyun/';
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

async function readFilesInFolder(folderPath) {
  try {
    const files = await fs.promises.readdir(folderPath);
    const filesData = [];

    for (const file of files) {
      console.log('p=', file);
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isFile()) {
        filesData.push(getFileStats(filePath));
      } else if (stats.isDirectory()) {
        filesData.push(...await readFilesInFolder(filePath));
        console.log(`delay ${delayInSeconds}s for folderPath: ${file}`);
        await delay(delayInSeconds * 1000); // 添加延迟
      }
    }

    return filesData;
  } catch (err) {
    throw err;
  }
}

readFilesInFolder(folderPath)
  .then(filesData => {
    fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
    console.log(`File data saved to ${outputFilePath}`);
  })
  .catch(err => {
    console.error(err);
  });