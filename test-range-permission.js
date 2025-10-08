const axios = require('axios');

async function testRangePermission() {
  try {
    // Replace this with a valid JWT token from your system
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ1c2VyMGV4YW1wbGUuY29tIiwiaWF0IjoxNzI4NDA2MzA2LCJleHAiOjE3Mjg0OTI3MDZ9.8xm6mW4jz7UNoN4MsP_s-7w6w6J7jz8e0spQrqko8aI';
    
    const response = await axios.get('http://localhost:3000/api/ranges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Success:', response.status, response.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data);
  }
}

testRangePermission();