const AdmZip = require('adm-zip');
const fs = require('fs');

try {
  const zip = new AdmZip('./builder-zen-world-main.zip');
  zip.extractAllTo('./', true);
  console.log('Zip file extracted successfully');
} catch (error) {
  console.error('Error extracting zip:', error);
}
