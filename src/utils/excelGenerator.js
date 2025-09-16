const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class ExcelGenerator {
  constructor() {
    this.defaultStyles = {
      header: {
        font: { bold: true, size: 12 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      },
      data: {
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
    };
  }

  /**
   * Generate statistics report in Excel format
   * @param {Array} moduleData - Module data array
   * @param {Array} headers - Column headers
   * @param {Array} labels - Row labels
   * @param {string} reportTitle - Report title
   * @returns {Buffer} Excel file buffer
   */
  async generateStatisticsReport(moduleData, headers, labels, reportTitle = 'Statistics Report') {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Month Wise Data');

      // Set worksheet properties
      worksheet.properties.defaultRowHeight = 20;

      // Add title row
      if (reportTitle) {
        const titleRow = worksheet.addRow([reportTitle]);
        titleRow.font = { bold: true, size: 16 };
        titleRow.alignment = { horizontal: 'center' };
        worksheet.mergeCells(1, 1, 1, headers.length);
        worksheet.addRow([]); // Empty row
      }

      // Add headers
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        Object.assign(cell, this.defaultStyles.header);
      });

      // Add data rows
      moduleData.forEach((moduleDTO, moduleIndex) => {
        if (moduleDTO.topics) {
          moduleDTO.topics.forEach((topic, topicIndex) => {
            if (topic.subTopics) {
              topic.subTopics.forEach((subTopic, subTopicIndex) => {
                if (subTopic.questions) {
                  subTopic.questions.forEach((question, questionIndex) => {
                    const rowData = [
                      moduleDTO.moduleName || '',
                      topic.topicName || '',
                      subTopic.subTopicName || '',
                      question.question || '',
                      question.answer || '',
                      question.type || '',
                      question.priority || 0
                    ];

                    const dataRow = worksheet.addRow(rowData);
                    dataRow.eachCell((cell) => {
                      Object.assign(cell, this.defaultStyles.data);
                    });
                  });
                }
              });
            }
          });
        }
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;

    } catch (error) {
      logger.error('Excel generation error:', error);
      throw new Error('Failed to generate Excel report');
    }
  }

  /**
   * Generate CID Crime Data Excel report
   * @param {Array} crimeData - Crime data array
   * @param {string} reportTitle - Report title
   * @returns {Buffer} Excel file buffer
   */
  async generateCrimeDataReport(crimeData, reportTitle = 'Crime Data Report') {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Crime Data');

      // Define headers
      const headers = [
        'Case No',
        'Crime Category',
        'Crime Type',
        'District',
        'Police Station',
        'Place of Occurrence',
        'Date',
        'Section',
        'Status',
        'Remark'
      ];

      // Add title
      if (reportTitle) {
        const titleRow = worksheet.addRow([reportTitle]);
        titleRow.font = { bold: true, size: 16 };
        worksheet.mergeCells(1, 1, 1, headers.length);
        worksheet.addRow([]);
      }

      // Add headers
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        Object.assign(cell, this.defaultStyles.header);
      });

      // Add data
      crimeData.forEach((crime) => {
        const rowData = [
          crime.caseNo || '',
          crime.crimeCategory?.nameOfCrimeCategory || '',
          crime.crimeType?.nameOfCrimeCategoryType || '',
          crime.district?.districtName || '',
          crime.policeStation?.policeStationName || '',
          crime.placeOfOccurance || '',
          crime.date ? new Date(crime.date).toLocaleDateString() : '',
          crime.section || '',
          crime.active ? 'Active' : 'Inactive',
          crime.remark || ''
        ];

        const dataRow = worksheet.addRow(rowData);
        dataRow.eachCell((cell) => {
          Object.assign(cell, this.defaultStyles.data);
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      return await workbook.xlsx.writeBuffer();

    } catch (error) {
      logger.error('Crime data Excel generation error:', error);
      throw new Error('Failed to generate crime data Excel report');
    }
  }

  /**
   * Generate user report in Excel format
   * @param {Array} userData - User data array
   * @param {string} reportTitle - Report title
   * @returns {Buffer} Excel file buffer
   */
  async generateUserReport(userData, reportTitle = 'User Report') {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      const headers = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'Mobile No',
        'Role',
        'State',
        'Range',
        'District',
        'Status',
        'Created Date'
      ];

      // Add title
      if (reportTitle) {
        const titleRow = worksheet.addRow([reportTitle]);
        titleRow.font = { bold: true, size: 16 };
        worksheet.mergeCells(1, 1, 1, headers.length);
        worksheet.addRow([]);
      }

      // Add headers
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        Object.assign(cell, this.defaultStyles.header);
      });

      // Add data
      userData.forEach((user) => {
        const rowData = [
          user.id || '',
          user.firstName || '',
          user.lastName || '',
          user.email || '',
          user.mobileNo || '',
          user.role?.roleName || '',
          user.state?.stateName || '',
          user.range?.rangeName || '',
          user.district?.districtName || '',
          user.active ? 'Active' : 'Inactive',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
        ];

        const dataRow = worksheet.addRow(rowData);
        dataRow.eachCell((cell) => {
          Object.assign(cell, this.defaultStyles.data);
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      return await workbook.xlsx.writeBuffer();

    } catch (error) {
      logger.error('User Excel generation error:', error);
      throw new Error('Failed to generate user Excel report');
    }
  }

  /**
   * Generate PDF report
   * @param {Array} data - Data to include in PDF
   * @param {string} title - Report title
   * @param {Array} headers - Table headers
   * @returns {Buffer} PDF buffer
   */
  async generatePDFReport(data, title = 'Report', headers = []) {
    try {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Add title
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown(2);

        // Add table
        if (data.length > 0 && headers.length > 0) {
          const tableTop = doc.y;
          const itemHeight = 20;
          let currentY = tableTop;

          // Headers
          doc.fontSize(12);
          headers.forEach((header, i) => {
            doc.text(header, 50 + (i * 100), currentY, { width: 90 });
          });

          currentY += itemHeight;
          doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
          currentY += 5;

          // Data rows
          data.forEach((row) => {
            headers.forEach((header, i) => {
              const value = row[header.toLowerCase()] || '';
              doc.text(value.toString(), 50 + (i * 100), currentY, { width: 90 });
            });
            currentY += itemHeight;
          });
        }

        doc.end();
      });

    } catch (error) {
      logger.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  /**
   * Generate CSV format data
   * @param {Array} data - Data array
   * @param {Array} headers - Column headers
   * @returns {string} CSV string
   */
  generateCSV(data, headers) {
    try {
      let csv = headers.join(',') + '\n';

      data.forEach((row) => {
        const rowValues = headers.map(header => {
          const value = row[header.toLowerCase()] || '';
          // Escape commas and quotes in CSV
          return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csv += rowValues.join(',') + '\n';
      });

      return csv;

    } catch (error) {
      logger.error('CSV generation error:', error);
      throw new Error('Failed to generate CSV data');
    }
  }
}

module.exports = new ExcelGenerator();