const fs = require('fs');
const path = require('path');
let name = 'slfdoc';
const folderPath = `/Volumes/dav_damo/baiduyun/${name}/`;
// const folderPath = './folder';
const outputFilePath = `a-${name}.json`;
const deleteFilePath = `d-${name}.json`;
const csvFilePath = `a-${name}.csv`;
function delIfExists(p) {
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
delIfExists(outputFilePath)
delIfExists(deleteFilePath)
delIfExists(csvFilePath)
const delayInSeconds = 1.8; // 设置延迟的秒数
fs.writeFileSync('pid.txt', `${process.pid}`)
function getFileStats(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return [filePath, stats.size];
    }
    return ['', ''];
  } catch (error) {
    return ['', ''];
  }
}

function appendLineToCSV(arr) {
  const csvData = `${arr.join(',')}\n`;
  fs.appendFileSync(csvFilePath, csvData); // 追加到 CSV 文件末尾
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readFilesInFolder(folderPath, deleteList) {
  const stack = [folderPath];
  const filesData = [];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      console.log('p=', filePath);
      const stats = await fs.promises.stat(filePath);

      if (stats.isFile()) {
        if (!filesData.length) appendLineToCSV(['filePath', 'size']);
        let line = getFileStats(filePath);
        filesData.push(line);
        appendLineToCSV(line);
      } else if (stats.isDirectory()) {
        if (file.endsWith('.app') || file === 'node_modules' || file === '.git') {
          deleteList.push(filePath); // 将待删除目录添加到列表
        } else {
          console.log(`delay ${delayInSeconds}s for folderPath: ${filePath}`);
          await delay(delayInSeconds * 1000); // 添加延迟
          stack.push(filePath);
        }
      }
    }
  }

  return filesData;
}

const deleteList = [];
const filesData = [];
readFilesInFolder(folderPath, deleteList)
  .then(result => {
    filesData.push(...result);

    fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
    console.log(`File data saved to ${outputFilePath}`);

    fs.writeFileSync(deleteFilePath, JSON.stringify(deleteList, null, 2));
    console.log(`Delete list saved to ${deleteFilePath}`);
  })
  .catch(err => {
    console.error(err);
  });

process.on('beforeExit', () => {
  console.log('beforeExit');
  if (!fs.existsSync(outputFilePath)) fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
  console.log(`File data saved to ${outputFilePath}`);

  if (!fs.existsSync(deleteFilePath)) fs.writeFileSync(deleteFilePath, JSON.stringify(deleteList, null, 2));
  console.log(`Delete list saved to ${deleteFilePath}`);
});