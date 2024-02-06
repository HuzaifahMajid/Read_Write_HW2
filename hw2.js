// Import the fs module
const fs = require('fs');

// Define the valid property names and their requirements
const validProperties = {
  IDENTIFIER: { required: true, unique: true },
  TIME: { required: true, unique: true },
  UNITS: { required: false, unique: true, dependsOn: 'WEIGHT' },
  WEIGHT: { required: false, unique: true },
  COLOR: { required: false, unique: true }
};

// Define the record delimiters
const beginRecord = 'BEGIN:RECORD';
const endRecord = 'END:RECORD';

// Define the input and output file names
const inputFile = 'records.txt';
const outputFile = 'sorted_records.txt';

// Define an array to store the records
let records = [];

// Define a function to sort the records by the TIME property
function sortByTime(records) {
  // Convert the TIME property value to a Date object
  records.forEach(record => {
    record.TIME = new Date(record.TIME);
  });
  // Sort the records in ascending order of the TIME property
  records.sort((a, b) => a.TIME - b.TIME);
  // Convert the TIME property value back to a string
  records.forEach(record => {
    record.TIME = record.TIME.toLocaleString();
  });
  return records;
}

// Define a function to validate a record
function validateRecord(record) {
  // Check if the record has the required properties
  for (let property in validProperties) {
    if (validProperties[property].required && !record.hasOwnProperty(property)) {
      return false;
    }
  }
  // Check if the record has the dependent properties
  for (let property in validProperties) {
    if (validProperties[property].dependsOn && record.hasOwnProperty(property) && !record.hasOwnProperty(validProperties[property].dependsOn)) {
      return false;
    }
  }
  // Check if the record has any unknown properties
  for (let property in record) {
    if (!validProperties.hasOwnProperty(property)) {
      return false;
    }
  }
  // Check if the record has any duplicate properties
  for (let property in validProperties) {
    if (validProperties[property].unique && Object.keys(record).filter(key => key === property).length > 1) {
      return false;
    }
  }
  // Check if the record has any missing property values
  for (let property in record) {
    if (record[property] === '') {
      return false;
    }
  }
  // If all checks pass, return true
  return true;
}

// Define a function to format a record as a string
function formatRecord(record) {
  // Start with the begin record delimiter
  let output = beginRecord + '\n';
  // Add each property and its value
  for (let property in record) {
    output += property + ':' + record[property] + '\n';
  }
  // End with the end record delimiter
  output += endRecord + '\n';
  return output;
}

// Create a read stream from the input file
let readStream = fs.createReadStream(inputFile, { encoding: 'utf8' });

// Create a write stream to the output file
let writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

// Define a variable to store the current record
let currentRecord = {};

// Define a variable to store the current line
let currentLine = '';

// Define a variable to store the error flag
let error = false;

// Handle the data event of the read stream
readStream.on('data', chunk => {
  // Loop through each character in the chunk
  for (let i = 0; i < chunk.length; i++) {
    // If the character is a newline, process the current line
    if (chunk[i] === '\n') {
      // Trim the whitespace from the current line
      currentLine = currentLine.trim();
      // If the current line is the begin record delimiter, start a new record
      if (currentLine.toUpperCase() === beginRecord) {
        currentRecord = {};
      }
      // If the current line is the end record delimiter, validate and store the current record
      else if (currentLine.toUpperCase() === endRecord) {
        // Validate the current record
        if (validateRecord(currentRecord)) {
          // Store the current record in the records array
          records.push(currentRecord);
        } else {
          // Set the error flag to true
          error = true;
          // Log the invalid record to the console
          console.error('Invalid record: ' + JSON.stringify(currentRecord));
        }
      }
      // If the current line is a property, parse and store it in the current record
      else {
        // Split the current line by the colon character
        let parts = currentLine.split(':');
        // If there are exactly two parts, store the property name and value in the current record
        if (parts.length === 2) {
          let name = parts[0].trim().toUpperCase();
          let value = parts[1].trim();
          currentRecord[name] = value;
        } else {
          // Set the error flag to true
          error = true;
          // Log the invalid property to the console
          console.error('Invalid property: ' + currentLine);
        }
      }
      // Reset the current line
      currentLine = '';
    }
    // If the character is not a newline, append it to the current line
    else {
      currentLine += chunk[i];
    }
  }
});

// Handle the end event of the read stream
readStream.on('end', () => {
  // If there is no error, sort and write the records to the output file
  if (!error) {
    // Sort the records by the TIME property
    records = sortByTime(records);
    // Write each record to the output file
    records.forEach(record => {
      writeStream.write(formatRecord(record));
    });
    // Log the success message to the console
    console.log('Successfully processed ' + records.length + ' records.');
  } else {
    // Log the failure message to the console
    console.log('Failed to process the records due to errors.');
  }
});

// Handle the error event of the read stream
readStream.on('error', err => {
  // Log the error to the console
  console.error(err);
});

// Handle the error event of the write stream
writeStream.on('error', err => {
  // Log the error to the console
  console.error(err);
});
