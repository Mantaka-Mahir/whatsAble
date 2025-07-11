// Test script to check if pending-followups endpoint works
const axios = require('axios');
const Message = require('./models/Message');
const database = require('./models/database');

async function checkPendingFollowups() {
    console.log('🧪 Testing pending-followups endpoint...\n');

    try {
        // Try to connect to the endpoint that n8n uses
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5000/api/n8n/pending-followups',
            headers: {
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        console.log('✅ Success! Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('Status:', response.status);

        // Check if we have data
        if (response.data && response.data.data && response.data.data.length === 0) {
            console.log('\n⚠️ No pending followups found. Let\'s modify messages directly to need followup...');

            try {
                // Directly modify the message data to create pending followups
                const messages = database.messages;

                // Find system messages and mark them as needing followup
                let modifiedCount = 0;
                messages.forEach(msg => {
                    if (!msg.isFromCustomer) {
                        // Make the message old and unread to trigger a followup
                        msg.sentAt = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
                        msg.isRead = false;
                        msg.needsFollowup = true;
                        modifiedCount++;
                    }
                });

                console.log(`✅ Modified ${modifiedCount} messages to need followup`);

                // Try the pending followups endpoint again
                const retryResponse = await axios({
                    method: 'GET',
                    url: 'http://localhost:5000/api/n8n/pending-followups',
                    headers: {
                        'Accept': 'application/json'
                    },
                    timeout: 5000
                });

                console.log('\n🔄 Checking pending followups again:');
                console.log(JSON.stringify(retryResponse.data, null, 2));
            } catch (error) {
                console.error('❌ Error modifying messages:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error checking pending followups:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

checkPendingFollowups();
