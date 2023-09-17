const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const name = 'baiduyun-all';
const csvFilePath = path.join(__dirname, `./storage/a-${name}.csv`);
const filteredFilePath = path.join(__dirname, `./storage/dav-filtered.csv`);
const separator = '##';

const KEYS = ["basename", "size", "etag", "mime", "lastmod", "filename"]; // csv文件信息收集列（可选其中任意列删除）
const title = KEYS.join(separator) + '\n';
const regexp = /^(.+),(\d*),([^,]+),([^,]*),(.+,[^,]*\sGMT),(.+)$/;
// Custom processing function for each row of data
function processRow(row) {
  // TODO: Implement your custom filtering logic here
  // Modify the row as per your requirements
  let rowstring = Object.values(row).join(',');
  let res = regexp.exec(rowstring);
  if (!res) {
    debugger
  }
  let obj = {};
  KEYS.forEach((key, i) => {
    obj[key] = res[i + 1]
    if (obj[key].indexOf(sp) > -1) console.error('err-----------------', obj[key], rowstring)
  });
  if (!obj.basename || !obj.filename) {
    debugger
  }
  return obj; // Return the modified row
}

function processRowStringToObj(rowstring) {
  // TODO: Implement your custom filtering logic here
  // Modify the row as per your requirements
  let res = rowstring.split('##');
  if (!res) {
    debugger
  }
  let obj = {};
  KEYS.forEach((key, i) => {
    obj[key] = res[i]
    if (obj[key].indexOf(separator) > -1) console.error('err-----------------', obj[key], rowstring)
  });
  if (!obj.basename || !obj.filename) {
    debugger
  }
  return obj; // Return the modified row
}

function processRowString(rowstring) {
  // TODO: Implement your custom filtering logic here
  // Modify the row as per your requirements
  let res = regexp.exec(rowstring);
  if (!res) {
    debugger
  }
  let obj = {};
  KEYS.forEach((key, i) => {
    obj[key] = res[i + 1]
    if (obj[key].indexOf(separator) > -1) console.error('err-----------------', obj[key], rowstring)
  });
  if (!obj.basename || !obj.filename) {
    debugger
  }
  return Object.values(obj).join(separator); // Return the modified row
}


module.exports = {
  name,
  csvFilePath,
  filteredFilePath,
  separator,
  KEYS,
  title,
  regexp,
  processRow,
  processRowString,
  processRowStringToObj
}
