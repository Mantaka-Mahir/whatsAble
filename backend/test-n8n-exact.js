// Test script to replicate exact n8n HTTP request
const axios = require('axios');

async function testExactN8nCall() {
    console.log('🧪 Testing exact n8n call...\n');

    try {
        // This simulates the exact call n8n makes
        const response = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:5000/api/n8n/send-message',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
                telegram_id: "987654321", // Our test user
                content: "Test message from simulated n8n call",
                type: "automated"
            },
            timeout: 30000
        });

        console.log('✅ Success! Response:', response.data);
        console.log('Status:', response.status);
        console.log('Headers:', response.headers['content-type']);

    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testExactN8nCall();
