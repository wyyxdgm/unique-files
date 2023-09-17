const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const readline = require('readline');

const name = 'dav-unique';

const { filteredFilePath, processRowStringToObj } = require('./dav-var')

const errPath = path.join(__dirname, `./storage/a-${name}-error.csv`);
const duplicateFilesPath = path.join(__dirname, `${name}-duplicateFiles.json`);
const similarFoldersPath = path.join(__dirname, `${name}-similarFolders.json`);

const duplicateFiles = {};
const similarFolders = {};
const errors = [];

// Read CSV file line by line
const rl = readline.createInterface({
  input: fs.createReadStream(filteredFilePath),
});

rl.on('line', (line) => {
  if (line == 'basename##size##etag##mime##lastmod##filename') return;
  const processedRow = processRowStringToObj(line);

  let { size, filename, basename } = processedRow;
  if (!filename || !basename) {
    console.log(processedRow);
    debugger
  }
  if (!duplicateFiles[basename]) {
    duplicateFiles[basename] = [];
  }
  duplicateFiles[basename].push({ size, filename });

  try {
    const folderName = path.dirname(filename);
    if (!similarFolders[folderName]) {
      similarFolders[folderName] = { count: 0, files: {} };
    }
    similarFolders[folderName].count++;
    if (!similarFolders[folderName].files[basename]) {
      similarFolders[folderName].files[basename] = 1;
    } else {
      similarFolders[folderName].files[basename]++;
    }
  } catch (error) {
    errors.push([row, error])
    console.log('error catch', row, error, filename);
  }
});

rl.on('close', () => {
  // Save duplicateFiles to JSON file
  const duplicateFilesJson = JSON.stringify(duplicateFiles, null, 2);
  fs.writeFileSync(duplicateFilesPath, duplicateFilesJson);
  console.log(`Duplicate Files saved to ${duplicateFilesPath}`);


  fs.writeFileSync(errPath, JSON.stringify(errors, null, 2));
  console.log(`Error Files saved to ${errPath}`);

  // Save similarFolders to JSON file
  const similarFoldersJson = JSON.stringify(similarFolders, null, 2);
  fs.writeFileSync(similarFoldersPath, similarFoldersJson);
  console.log(`Similar Folders saved to ${similarFoldersPath}`);
})
rl.on('error', (err) => {
  console.error('Error reading CSV file:', err);
});