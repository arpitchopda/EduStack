const fs = require('fs');

async function testUpload() {
  const fetch = (await import('node-fetch')).default;
  const FormData = require('form-data');
  
  const filePath = 'public/test_data.csv';
  const fileBuffer = fs.readFileSync(filePath);
  
  const formData = new FormData();
  formData.append('file', fileBuffer, 'test_data.csv');

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text.substring(0, 500)}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
