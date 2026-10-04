const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  const fetch = (await import('node-fetch')).default;
  
  const filePath = 'public/uploads/1786945807084_Summary_91-120.csv';
  const fileBuffer = fs.readFileSync(filePath);
  
  const formData = new FormData();
  formData.append('file', fileBuffer, {
    filename: 'Summary_91-120.csv',
    contentType: 'text/csv',
  });

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text.substring(0, 1000)}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
