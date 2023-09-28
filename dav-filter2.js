const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const readline = require('readline');

const { name, csvFilePath, filteredFilePath, filteredJsonFilePath, separator, KEYS, title, regexp, processRowStringObj } = require('./dav-var')

const fixedPath = path.join(__dirname, `./storage/dav-fixed.json`);
const fixedJson = [];

// Create a writable stream to write filtered data to the new file
const filteredStream = fs.createWriteStream(filteredFilePath);
filteredStream.write(title);

// Read CSV file line by line
const rl = readline.createInterface({
  input: fs.createReadStream(csvFilePath),
});
const array = [];
rl.on('line', (line) => {
  if (line == 'basename,size,etag,mime,lastmod,filename') return;
  const [processedRow, obj] = processRowStringObj(line);

  // let diffs = KEYS.find(key => (processedRow[key] != row[key]));
  // if (diffs) {
  //   // console.log('fixed', row, processedRow);
  //   fixedJson.push([row, processRow])
  // } else {
  //   // console.log('nothing to fixed')
  // }
  array.push(obj);
  if (processedRow) {
    // Write the filtered row to the new file
    filteredStream.write(`${processedRow}\n`);
  }
});
rl.on('close', () => {
  // Close the filtered stream when finished writing
  filteredStream.end();
  console.log(`Filtered data saved to ${filteredFilePath}`);

  fs.writeFileSync(fixedPath, JSON.stringify(fixedJson, null, 2));

  fs.writeFileSync(filteredJsonFilePath, JSON.stringify(array, null, 2));

});

rl.on('error', (err) => {
  console.error('Error reading CSV file:', err);
});

// // Read CSV file and process each row
// fs.createReadStream(csvFilePath)
//   .pipe(csv())
//   .on('data', (row) => {
//     const processedRow = processRow(row);

//     let diffs = KEYS.find(key => (processedRow[key] != row[key]));
//     if (diffs) {
//       // console.log('fixed', row, processedRow);
//       fixedJson.push([row, processRow])
//     } else {
//       // console.log('nothing to fixed')
//     }
//     if (processedRow) {
//       // Write the filtered row to the new file
//       filteredStream.write(`${Object.values(processedRow).join(separator)}\n`);
//     }
//   })
//   .on('end', () => {
//     // Close the filtered stream when finished writing
//     filteredStream.end();
//     console.log(`Filtered data saved to ${filteredFilePath}`);
//     fs.writeFileSync(fixedPath, JSON.stringify(fixedJson, null, 2));
//   })
//   .on('error', (err) => {
//     console.error('Error reading CSV file:', err);
//   });