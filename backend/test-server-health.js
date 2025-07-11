// Simple script to check if the server is running
const axios = require('axios');

async function checkServerHealth() {
    console.log('🧪 Testing server health...\n');

    try {
        // Try to connect to the server's health endpoint
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5000/api/n8n/health',
            headers: {
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        console.log('✅ Server is running! Response:', response.data);
        console.log('Status:', response.status);

    } catch (error) {
        console.error('❌ Error connecting to server:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });

        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔄 Solution: Start the server with "npm run dev" in the backend directory');
        }
    }
}

checkServerHealth();
