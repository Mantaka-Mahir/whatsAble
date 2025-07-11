// Simple test script to verify n8n connectivity
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api';

async function testN8nIntegration() {
    console.log('🧪 Testing N8N Integration...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health check...');
        const healthCheck = await axios.get(`${BACKEND_URL}/n8n/health`);
        console.log('✅ Health check passed:', healthCheck.data);

        // Test 2: Create a new lead
        console.log('\n2. Testing new lead creation...');
        const newLead = await axios.post(`${BACKEND_URL}/n8n/new-lead`, {
            name: 'John Doe',
            phone: '+1234567890',
            email: 'john@example.com',
            source: 'telegram',
            telegram_id: '123456789'
        });
        console.log('✅ New lead created:', newLead.data);

        // Test 3: Send a message
        console.log('\n3. Testing message sending...');
        const sendMessage = await axios.post(`${BACKEND_URL}/n8n/send-message`, {
            phone: '+1234567890',
            content: 'Hello! This is a test message from n8n',
            type: 'automated'
        });
        console.log('✅ Message sent:', sendMessage.data);

        // Test 4: Get users
        console.log('\n4. Testing get users...');
        const users = await axios.get(`${BACKEND_URL}/n8n/users`);
        console.log('✅ Users retrieved:', users.data.data.length, 'users');

        // Test 5: Get pending followups
        console.log('\n5. Testing pending followups...');
        const followups = await axios.get(`${BACKEND_URL}/n8n/pending-followups`);
        console.log('✅ Pending followups:', followups.data.data.length, 'followups');

        console.log('\n🎉 All tests passed! N8N integration is working.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testN8nIntegration();
