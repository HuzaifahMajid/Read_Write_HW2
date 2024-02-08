const fs = require('fs');

// Define the set of allowed property names
const allowedProperties = new Set(['IDENTIFIER', 'TIME', 'UNITS', 'WEIGHT', 'COLOR']);

// Function to validate the TIME property format
function isValidTimeFormat(timeString) {
  const timeRegex = /^\d{8}T\d{6}$/;
  return timeRegex.test(timeString);
}

// Function to parse the TIME property value
function parseTimeValue(timeString) {
  // Assuming the timeString is in the format YYYYMMDDTHHMMSS
  const year = timeString.slice(0, 4);
  const month = timeString.slice(4, 6);
  const day = timeString.slice(6, 8);
  const hour = timeString.slice(9, 11);
  const minute = timeString.slice(11, 13);
  const second = timeString.slice(13, 15);

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

// Function to sort records by TIME property
function sortByTime(records) {
  records.sort((a, b) => {
    const timeA = parseTimeValue(a.properties.TIME);
    const timeB = parseTimeValue(b.properties.TIME);
    return timeA - timeB;
  });
}

// Function to validate and process records
function processRecords(records) {
  records.forEach((record) => {
    const requiredProperties = ['IDENTIFIER', 'TIME'];
    if (record.properties.WEIGHT) {
      requiredProperties.push('UNITS');
    }

    requiredProperties.forEach((property) => {
      if (!record.properties[property]) {
        console.error(`Missing required property "${property}" in record with IDENTIFIER "${record.properties.IDENTIFIER}".`);
        record.isValid = false;
      }
    });

    Object.keys(record.properties).forEach((property) => {
      if (!allowedProperties.has(property)) {
        console.error(`Unknown property "${property}" in record with IDENTIFIER "${record.properties.IDENTIFIER}".`);
        record.isValid = false;
      }
    });

    // Check if TIME property has the correct format
    if (record.properties.TIME && !isValidTimeFormat(record.properties.TIME)) {
      console.error(`Invalid TIME format in record with IDENTIFIER "${record.properties.IDENTIFIER}".`);
      record.isValid = false;
    }
  });
}

// Read the input file
fs.readFile('input_records.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the input file:', err);
    return;
  }

  const lines = data.split('\n');
  const records = [];
  let currentRecord = null;

  lines.forEach((line) => {
    if (line.toUpperCase() === 'BEGIN:RECORD') {
      currentRecord = { properties: {}, isValid: true };
    } else if (line.toUpperCase() === 'END:RECORD') {
      if (currentRecord) {
        records.push(currentRecord);
        currentRecord = null;
      }
    } else {
      const [propertyName, propertyValue] = line.split(':');
      const trimmedPropertyName = propertyName.trim().toUpperCase();
      const trimmedPropertyValue = propertyValue ? propertyValue.trim() : '';

      if (currentRecord) {
        if (currentRecord.properties[trimmedPropertyName]) {
          console.error(`Duplicate property "${trimmedPropertyName}" in record with IDENTIFIER "${currentRecord.properties.IDENTIFIER}".`);
          currentRecord.isValid = false;
        } else {
          currentRecord.properties[trimmedPropertyName] = trimmedPropertyValue;
        }
      }
    }
  });

  // Validate and process records
  processRecords(records);

  // Filter out invalid records
  const validRecords = records.filter((record) => record.isValid);

  // Sort valid records by TIME property
  sortByTime(validRecords);

  // Write the output file
  const outputData = validRecords
    .map((record) => `BEGIN:RECORD\n${Object.entries(record.properties).map(([key, value]) => `${key}:${value}`).join('\n')}\nEND:RECORD\n`)
    .join('\n');

  fs.writeFile('sorted_records.txt', outputData, (writeErr) => {
    if (writeErr) {
      console.error('Error writing the output file:', writeErr);
    } else {
      console.log('Processing complete. Output written to "sorted_records.txt".');
    }
  });
});
module.exports = { isValidTimeFormat,parseTimeValue, processRecords, sortByTime };