const fs = require("fs");
const path = require("path");
const retry = require('./retry.js').retry;
let name = "aliyun"; // 本次任务标识
const folderPath = `/Volumes/undefined/${name}/`; // 本地磁盘目录
const outputFilePath = path.join(__dirname, `./storage/a.json`); // json文件输出地址
const deleteFilePath = path.join(__dirname, `./storage/d.json`); // 重复列表
const csvFilePath = path.join(__dirname, `./storage/a-${name}.csv`);// csv输出文件地址
const errJsonPath = path.join(__dirname, `./storage/a-error.json`); // 存储异常日志
const pidfile = path.join(__dirname, `./storage/pid-${name}.txt`); // 存储pid
const exps = []; // 存储异常数据
/**
 * 是否过滤某个文件或文件夹
 * @param {*} file 文件名
 * @returns 是否过滤
 */
function exclude(file) {
  if (!file) return true;
  return (
    file === "node_modules" ||
    file === ".git" ||
    file.startsWith(".") ||
    file.endsWith(".app") ||
    file.endsWith(".photoslibrary")
  );
}

function delIfExists(p) {
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
delIfExists(outputFilePath);
delIfExists(deleteFilePath);
delIfExists(csvFilePath);
delIfExists(errJsonPath);
const delayInSeconds = .5; // 设置延迟的秒数
fs.writeFileSync(pidfile, `${process.pid}`);
function getFileStats(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return [filePath, stats.size];
    }
    return ["", ""];
  } catch (error) {
    return ["", ""];
  }
}

function appendLineToCSV(arr) {
  const csvData = `${arr.join(",")}\n`;
  fs.appendFileSync(csvFilePath, csvData); // 追加到 CSV 文件末尾
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readFilesInFolder(folderPath, deleteList) {
  const stack = [[folderPath, 0]];
  const filesData = [];
  while (stack.length > 0) {
    try {
      const [currentPath, level] = stack.pop();
      let dd = Math.max(0, 5 - level) * 1000;
      // console.log(`delay for level=`, level, dd / 1000, "s");
      // await delay(dd);
      const files = await retry(async () => await fs.promises.readdir(currentPath), 20, 5, (err) => {
        exps.push(currentPath, err && err.toString() || err)
        return []
      });
      console.log('currentPath', currentPath, 'files', files);

      for (const file of files) {
        const filePath = path.join(currentPath, file);
        console.log("p=", filePath);
        if (fs.existsSync(filePath)) {
          const stats = await retry(async () => await fs.promises.stat(filePath), 20, 5, (err) => {
            exps.push(filePath, err && err.toString() || err)
            return null;
          });
          if (!stats) {
            console.log('!stats', filePath);
            continue;
          }
          if (stats.isFile()) {
            if (!filesData.length) appendLineToCSV(["filePath", "size"]);
            let line = getFileStats(filePath);
            filesData.push(line);
            appendLineToCSV(line);
          } else if (stats.isDirectory()) {
            if (exclude(file)) {
              deleteList.push(filePath); // 将待删除目录添加到列表
            } else {
              console.log(`delay ${delayInSeconds}s for folderPath: ${filePath}`);
              await delay(delayInSeconds * 1000); // 添加延迟
              stack.push([filePath, level + 1]);
            }
          }
        } else {
          console.log(`folderPath not exists: ${filePath}`);
        }

      }
    } catch (error) {
      console.log(error);
    }
  }

  return filesData;
}

const deleteList = [];
const filesData = [];
readFilesInFolder(folderPath, deleteList)
  .then((result) => {
    filesData.push(...result);

    fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
    console.log(`File data saved to ${outputFilePath}`);

    fs.writeFileSync(deleteFilePath, JSON.stringify(deleteList, null, 2));
    console.log(`Delete list saved to ${deleteFilePath}`);
  })
  .catch((err) => {
    console.error(err);
  });

process.on("beforeExit", () => {
  console.log("beforeExit");
  if (!fs.existsSync(outputFilePath)) fs.writeFileSync(outputFilePath, JSON.stringify(filesData, null, 2));
  console.log(`File data saved to ${outputFilePath}`);

  fs.writeFileSync(errJsonPath, JSON.stringify(exps, null, 2));
  if (!fs.existsSync(deleteFilePath)) fs.writeFileSync(deleteFilePath, JSON.stringify(deleteList, null, 2));
  console.log(`Delete list saved to ${deleteFilePath}`);
});