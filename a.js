const fs = require('fs');
const path = require('path');

const folderPath = '/Volumes/dav_damo/baiduyun/';
// const folderPath = './folder';
const outputFilePath = 'a.json';
const deleteFilePath = 'd.json';
const delayInSeconds = 1.6; // 设置延迟的秒数
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

async function readFilesInFolder(folderPath, deleteList) {
  try {
    const files = await fs.promises.readdir(folderPath);
    const filesData = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      console.log('p=', filePath);
      const stats = await fs.promises.stat(filePath);

      if (stats.isFile()) {
        filesData.push(getFileStats(filePath));
      } else if (stats.isDirectory()) {
        if (file.endsWith('.app') || file === 'node_modules') {
          deleteList.push(filePath); // 将待删除目录添加到列表
        } else {
          filesData.push(...await readFilesInFolder(filePath, deleteList));
          console.log(`delay ${delayInSeconds}s for folderPath: ${filePath}`);
          await delay(delayInSeconds * 1000); // 添加延迟
        }
      }
    }

    return filesData;
  } catch (err) {
    throw err;
  }
}
const deleteList = [];
readFilesInFolder(folderPath, deleteList)
  .then(filesData => {
    fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
    console.log(`File data saved to ${outputFilePath}`);

    fs.writeFileSync(deleteFilePath, JSON.stringify(deleteList, null, 2));
    console.log(`Delete list saved to ${deleteFilePath}`);
  })
  .catch(err => {
    console.error(err);
  });