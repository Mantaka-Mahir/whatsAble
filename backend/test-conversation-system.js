// Comprehensive test for WhatsApp-style conversation system
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testConversationSystem() {
    console.log('🧪 Testing WhatsApp-style Conversation System...\n');

    try {
        // Test 1: Health check with new conversation fields
        console.log('1. Testing health check with conversation fields...');
        const health = await axios.get(`${BASE_URL}/n8n/health`);
        console.log('✅ Health check:', health.data.data);

        // Test 2: Create a new lead with telegram_id
        console.log('\n2. Creating new lead with telegram_id...');
        const testTelegramId = `test_${Date.now()}`;
        const newLead = await axios.post(`${BASE_URL}/n8n/new-lead`, {
            name: 'Test Conversation User',
            phone: `+1555${Math.floor(Math.random() * 1000000)}`,
            email: `test${Date.now()}@example.com`,
            source: 'telegram',
            telegram_id: testTelegramId
        });
        console.log('✅ New lead created:', newLead.data.data.user.name);
        const userId = newLead.data.data.user.id;

        // Test 3: Send initial message from admin (creates conversation)
        console.log('\n3. Sending initial message from admin...');
        const adminMessage = await axios.post(`${BASE_URL}/n8n/send-message`, {
            telegram_id: testTelegramId,
            content: 'Hello! Welcome to WhatsAble. How can I help you today?',
            type: 'automated'
        });
        console.log('✅ Admin message sent:', adminMessage.data.data.conversationMessage.content);

        // Test 4: Process customer response
        console.log('\n4. Processing customer response...');
        const customerResponse = await axios.post(`${BASE_URL}/n8n/process-response`, {
            telegram_id: testTelegramId,
            response_text: 'Hi! I need help with customer follow-up automation.',
            original_message_id: adminMessage.data.data.message.id
        });
        console.log('✅ Customer response processed:', customerResponse.data.data.conversationMessage.content);

        // Test 5: Get conversation history
        console.log('\n5. Getting conversation history...');
        const conversation = await axios.get(`${BASE_URL}/n8n/conversation/${userId}?telegram_id=${testTelegramId}&limit=10`);
        console.log('✅ Conversation history retrieved:');
        console.log('   - Conversation ID:', conversation.data.data.conversation_id);
        console.log('   - User:', conversation.data.data.user_name);
        console.log('   - Messages:', conversation.data.data.message_count);
        
        // Display messages in WhatsApp style
        console.log('\n   📱 WhatsApp-style conversation:');
        conversation.data.data.messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? '👤 Customer' : '🤖 Assistant';
            const time = new Date(msg.timestamp).toLocaleTimeString();
            console.log(`   ${role} [${time}]: ${msg.content}`);
        });

        // Test 6: Send AI response using conversation context
        console.log('\n6. Sending AI response with context...');
        const aiResponse = await axios.post(`${BASE_URL}/n8n/send-message`, {
            telegram_id: testTelegramId,
            content: 'Great! I can help you with customer follow-up automation. Our platform can automatically follow up with customers who haven\'t responded to your initial messages.',
            type: 'automated'
        });
        console.log('✅ AI response sent:', aiResponse.data.data.conversationMessage.content);

        // Test 7: Get updated conversation
        console.log('\n7. Getting updated conversation...');
        const updatedConversation = await axios.get(`${BASE_URL}/n8n/conversation/${userId}?telegram_id=${testTelegramId}&limit=10`);
        console.log('✅ Updated conversation:');
        console.log('   - Total messages:', updatedConversation.data.data.message_count);
        
        console.log('\n   📱 Updated WhatsApp-style conversation:');
        updatedConversation.data.data.messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? '👤 Customer' : '🤖 Assistant';
            const time = new Date(msg.timestamp).toLocaleTimeString();
            console.log(`   ${role} [${time}]: ${msg.content}`);
        });

        // Test 8: Test conversation endpoints
        console.log('\n8. Testing conversation endpoints...');
        const allConversations = await axios.get(`${BASE_URL}/n8n/conversations`);
        console.log('✅ All conversations retrieved:', allConversations.data.data.length);

        // Test 9: Final health check
        console.log('\n9. Final health check...');
        const finalHealth = await axios.get(`${BASE_URL}/n8n/health`);
        console.log('✅ Final health check:', finalHealth.data.data);

        console.log('\n🎉 All conversation tests passed!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${finalHealth.data.data.users_count}`);
        console.log(`   - Messages: ${finalHealth.data.data.messages_count}`);
        console.log(`   - Conversations: ${finalHealth.data.data.conversations_count}`);
        console.log(`   - Active conversations: ${finalHealth.data.data.active_conversations}`);
        console.log(`   - Unread conversations: ${finalHealth.data.data.unread_conversations}`);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('   Status:', error.response.status);
        }
    }
}

// Run the test
testConversationSystem();
