const fs = require('fs');
const jasmine = require('jasmine');
const { isValidTimeFormat, processRecords, sortByTime } = require('../src/hw2');

describe('Record Processing Program', () => {

  let records;

  beforeEach(() => {
    records = [
      {
        properties: {
          IDENTIFIER: '1',
          TIME: '20220101T120000',
          UNITS: 'kg'
        },
        isValid: true
      },
      {
        properties: {
          IDENTIFIER: '2',
          TIME: '20220102T150000',
          UNITS: 'lbs'
        },
        isValid: true
      },

    ];
  });

  it('should validate records and process them correctly', () => {
    processRecords(records);
    expect(records.every(record => record.isValid)).toBe(true);
  });

  it('should sort records by TIME property', () => {
    sortByTime(records);
    const sortedTimes = records.map(record => record.properties.TIME);
    const expectedSortedTimes = sortedTimes.slice().sort();
    expect(sortedTimes).toEqual(expectedSortedTimes);
  });

  it('should handle missing required properties', () => {
    records[0].properties.IDENTIFIER = undefined;
    processRecords(records);
    expect(records[0].isValid).toBe(false);
  });

  it('should handle missing UNITS property when WEIGHT is present', () => {
    records[1].properties.WEIGHT = '50';
    records[1].properties.UNITS = undefined;
    processRecords(records);
    expect(records[1].isValid).toBe(false);
  });

  it('should handle unknown properties', () => {
    records[0].properties.UNKNOWN_PROPERTY = 'value';
    processRecords(records);
    expect(records[0].isValid).toBe(false);
  });

  it('should handle duplicate properties', () => {
    records[1].properties.IDENTIFIER = '2';
    processRecords(records);
    expect(records[1].isValid).toBe(false);
  });

  it('should handle invalid TIME format', () => {
    records[0].properties.TIME = '20220101T12:00:00';
    processRecords(records);
    expect(records[0].isValid).toBe(false);
  });

  it('should handle multiple records with the same TIME', () => {
    records[0].properties.TIME = '20220101T120000';
    processRecords(records);
    expect(records[0].isValid).toBe(false);
    expect(records[1].isValid).toBe(false);
  });

  // Additional Test Cases

  it('should handle records with the minimum valid TIME value', () => {
    records[0].properties.TIME = '00000101T000000';
    processRecords(records);
    expect(records[0].isValid).toBe(true);
  });

  it('should handle records with the maximum valid TIME value', () => {
    records[0].properties.TIME = '99991231T235959';
    processRecords(records);
    expect(records[0].isValid).toBe(true);
  });

  it('should handle sorting records with earliest and latest TIME values', () => {
    records[0].properties.TIME = '20220101T000000';
    records[1].properties.TIME = '20220102T235959';
    sortByTime(records);
    expect(records[0].properties.TIME).toBe('20220101T000000');
    expect(records[1].properties.TIME).toBe('20220102T235959');
  });

  it('should handle records with optional properties (WEIGHT, COLOR)', () => {
    records[0].properties.WEIGHT = '50';
    records[0].properties.COLOR = 'red';
    processRecords(records);
    expect(records[0].isValid).toBe(true);
  });

  it('should handle records with valid WEIGHT and UNITS', () => {
    records[0].properties.WEIGHT = '50';
    records[0].properties.UNITS = 'kg';
    processRecords(records);
    expect(records[0].isValid).toBe(true);
  });

  it('should handle records with unknown properties', () => {
    records[0].properties.UNKNOWN_PROPERTY = 'value';
    processRecords(records);
    expect(records[0].isValid).toBe(false);
  });

  it('should handle records with duplicate IDENTIFIER', () => {
    records[1].properties.IDENTIFIER = '1';
    processRecords(records);
    expect(records[1].isValid).toBe(false);
  });

  it('should handle empty input file', () => {
    records = [];
    processRecords(records);
    expect(records.length).toBe(0);
  });

  it('should handle a file with no records', () => {
    records = [];
    processRecords(records);
    expect(records.length).toBe(0);
  });

  it('should handle records with different property order', () => {
    const propertyOrderChangedRecord = {
      properties: {
        TIME: '20220101T120000',
        UNITS: 'kg',
        IDENTIFIER: '1',
      },
      isValid: true,
    };
    records.push(propertyOrderChangedRecord);
    processRecords(records);
    expect(propertyOrderChangedRecord.isValid).toBe(true);
  });


});

const jasmineRunner = new jasmine();
jasmineRunner.execute();
