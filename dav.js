
/**
 * 列出dav的所有文件信息到csv中
 */
const fs = require("fs");
const path = require("path");
const createClient = require("webdav").createClient;
const retry = require('./retry.js').retry;
// 参数
const webdavUrl = "http://localhost:5240/dav"; // dav 地址
const username = "admin"; // 用户名
const password = "12345"; // 密码
let folderPath = "baiduyun"; // dav列表中的目标目录
const name = `${folderPath}`; // 日志输出标识
let remoteBasePath = '../dav/${folderPath}';

const outputFilePath = path.join(__dirname, `./storage/a-${name}.json`); // json文件输出地址
const deleteFilePath = path.join(__dirname, `./storage/d-${name}.json`); // 排除的文件或文件夹列表
const csvFilePath = path.join(__dirname, `./storage/a-${name}.csv`); // csv文件输出地址
const errJsonPath = path.join(__dirname, `./storage/a-${name}-error.json`); // 存储异常日志
const pidfile = path.join(__dirname, `./storage/pid-${name}.txt`); // 存储pid
const exps = []; // 存储异常数据

const delayInSeconds = .5; // 设置延迟的秒数
const KEYS = ["basename", "size", "etag", "mime", "lastmod", "filename"]; // csv文件信息收集列（可选其中任意列删除）

const deleteList = []; // 存储运行时本地忽略的文件或文件夹列表
const filesData = []; // 存储运行时文件列表

const client = createClient(webdavUrl, {
  username,
  password,
  remoteBasePath
});

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

function getFileStats(fileObj) {
  try {
    let res = [];
    for (let key of KEYS) {
      res.push(fileObj[key] || '');
    }
    return res;
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

      // await delay(dd);
      const files = await retry(async () => {
        console.log('list dir', currentPath);
        const directoryItems = await client.getDirectoryContents(currentPath);
        return directoryItems;
      }, 20, 5, (err) => {
        exps.push(currentPath, err && err.toString() || err);
        return [];
      });

      console.log('currentPath', currentPath, 'files', files.map(f => f.basename).join('|'));

      for (const file of files.slice(1)) {
        const filePath = path.join(currentPath, file.basename);
        console.log("p=", filePath);

        if (file.type === "file") {
          if (!filesData.length) appendLineToCSV(KEYS);
          let line = getFileStats(file);
          filesData.push(line);
          appendLineToCSV(line);
        } else if (file.type === "directory") {
          if (exclude(file.basename)) {
            deleteList.push(filePath); // 将待删除目录添加到列表
          } else {
            console.log(`delay ${delayInSeconds}s for folderPath: ${filePath}`);
            await delay(delayInSeconds * 1000); // 添加延迟
            console.log('stack push', filePath);
            stack.push([filePath, level + 1]);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return filesData;
}

delIfExists(outputFilePath);
delIfExists(deleteFilePath);
delIfExists(csvFilePath);
delIfExists(errJsonPath);

fs.writeFileSync(pidfile, `${process.pid}`);

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