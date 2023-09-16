import fs from "fs";
import path from "path";
import axios from "axios";
import { createClient } from "webdav";
import { retry } from './retry.js';

const username = "admin";
const password = "12345";
let name = "baiduyun";
let remoteBasePath = '/baiduyun';
const webdavUrl = "http://192.168.3.100:5240/dav";
const client = createClient(webdavUrl, {
  username,
  password,
  remoteBasePath: '../dav/baiduyun'
});

const folderPath = `/${name}`;
const outputFilePath = `a-${name}.json`;
const deleteFilePath = `d-${name}.json`;
const csvFilePath = `a-${name}.csv`;
const errJsonPath = `a-error.json`;
const exps = [];
function delIfExists(p) {
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

delIfExists(outputFilePath);
delIfExists(deleteFilePath);
delIfExists(csvFilePath);
delIfExists(errJsonPath);

const delayInSeconds = .5; // 设置延迟的秒数
fs.writeFileSync("pid.txt", `${process.pid}`);
const KEYS = ["filename", "size", "etag", "mime", "lastmod", "filePath"];
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

      console.log('currentPath', currentPath, 'files', files.map(f => f.filename).join('|'));

      for (const file of files) {
        const filePath = path.join(currentPath, file.filename);
        console.log("p=", filePath);

        if (file.type === "file") {
          if (!filesData.length) appendLineToCSV(KEYS);
          let line = getFileStats(file);
          filesData.push(line);
          appendLineToCSV(line);
        } else if (file.type === "directory") {
          if (exclude(file.filename)) {
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