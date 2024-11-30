// Supabase Client Setup
const supabaseUrl = 'https://inseouxmqezjurzepaom.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluc2VvdXhtcWV6anVyemVwYW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDI1MTUsImV4cCI6MjA0ODQ3ODUxNX0.SNWExT_vF_hcL01W-m-T3jhO_M_Qxswr1JWHW-7ylg8'; // Replace with your Supabase Anon Key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Fetch Messages and Display Them
async function fetchMessages() {
    try {
        // Fetch all messages, sorted by created_at
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return;
        }

        // Clear the messages container
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';

        // Display each message
        data.forEach((message) => {
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `
                <strong>${message.username || 'Anonymous'}</strong>: ${message.message}
            `;
            messagesDiv.appendChild(messageElement);
        });
    } catch (err) {
        console.error('Unexpected error fetching messages:', err);
    }
}

// Send Message to the Database
async function sendMessage() {
    const usernameInput = document.getElementById('username'); // Username input field
    const messageInput = document.getElementById('message');  // Message input field

    const username = usernameInput.value.trim() || 'Anonymous'; // Default to Anonymous if empty
    const message = messageInput.value.trim();

    // Validate inputs
    if (!message) {
        alert('Please enter a message!');
        return;
    }

    try {
        // Insert the message into the database
        const { error } = await supabase
            .from('messages')
            .insert([{ username, message }]);

        if (error) {
            console.error('Error sending message:', error);
        } else {
            // Clear the message input field and refresh messages
            messageInput.value = '';
            fetchMessages();
        }
    } catch (err) {
        console.error('Unexpected error sending message:', err);
    }
}

// Listen for New Messages in Real-Time
function listenForMessages() {
    supabase
        .channel('realtime:messages')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                const newMessage = payload.new;
                const messagesDiv = document.getElementById('messages');
                const messageElement = document.createElement('div');
                messageElement.innerHTML = `
                    <strong>${newMessage.username || 'Anonymous'}</strong>: ${newMessage.message}
                `;
                messagesDiv.appendChild(messageElement);
            }
        )
        .subscribe();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchMessages(); // Fetch messages when the page loads
    listenForMessages(); // Start listening for real-time updates

    const sendButton = document.getElementById('send'); // Send button
    sendButton.addEventListener('click', sendMessage); // Handle message sending
});

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files from the 'public' folder
app.use(express.static('public'));

// Example API route (for backend functionality)
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
