// Frontend Integration Example for Your Existing User Data
// This shows how to connect your frontend to the backend

const API_BASE_URL = 'http://localhost:3000/api';

// 1. Login with existing user credentials
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login successful:', data.user);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// 2. Get user profile and platform status
async function getUserProfile() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('User profile:', data.user);
    return data.user;
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error;
  }
}

// 3. Test platform connections
async function testPlatformConnections() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/platforms/test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const results = await response.json();
    console.log('Platform connection tests:', results);
    return results;
  } catch (error) {
    console.error('Failed to test connections:', error);
    throw error;
  }
}

// 4. Start data sync for all connected platforms
async function startDataSync() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/data-sync/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        platforms: ['shopify', 'meta', 'shiprocket']
      })
    });
    
    const data = await response.json();
    console.log('Data sync started:', data);
    
    // Start tracking progress
    if (data.jobId) {
      trackSyncProgress(data.jobId);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to start sync:', error);
    throw error;
  }
}

// 5. Track sync progress with WebSocket
function trackSyncProgress(jobId) {
  const socket = io('http://localhost:3000');
  
  socket.emit('join-job', jobId);
  
  socket.on('progress', (data) => {
    console.log(`Sync Progress: ${data.progress}%`);
    console.log(`Status: ${data.message}`);
    
    // Update your UI here
    updateProgressBar(data.progress);
    updateStatusMessage(data.message);
    
    if (data.progress === 100) {
      console.log('Sync completed!', data.results);
      onSyncComplete(data.results);
    }
  });
  
  socket.on('error', (data) => {
    console.error('Sync error:', data.error);
    onSyncError(data.error);
  });
}

// 6. Send chat message
async function sendChatMessage(message, sessionId = null) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, sessionId })
    });
    
    const data = await response.json();
    console.log('Chat response:', data);
    return data;
  } catch (error) {
    console.error('Chat failed:', error);
    throw error;
  }
}

// 7. Example usage flow
async function exampleUsage() {
  try {
    // Login with your existing credentials
    const loginData = await loginUser('taneshpurohit09@gmail.com', 'your_password');
    
    // Get user profile to see platform connections
    const profile = await getUserProfile();
    
    // Test if all platforms are working
    const connectionTests = await testPlatformConnections();
    
    // If connections are good, start data sync
    if (connectionTests.shopify.success && connectionTests.meta.success && connectionTests.shiprocket.success) {
      await startDataSync();
    }
    
    // After sync completes, you can start chatting
    setTimeout(async () => {
      const chatResponse = await sendChatMessage("What were my top selling products last month?");
      console.log('AI Response:', chatResponse.response);
    }, 5000);
    
  } catch (error) {
    console.error('Example usage failed:', error);
  }
}

// UI Helper functions (implement these in your frontend)
function updateProgressBar(progress) {
  // Update your progress bar UI
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

function updateStatusMessage(message) {
  // Update status message UI
  const statusElement = document.getElementById('sync-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function onSyncComplete(results) {
  // Handle sync completion
  console.log('Data sync completed successfully!');
  // Enable chat interface, show success message, etc.
}

function onSyncError(error) {
  // Handle sync error
  console.error('Data sync failed:', error);
  // Show error message to user
}

// Export for use in your frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loginUser,
    getUserProfile,
    testPlatformConnections,
    startDataSync,
    sendChatMessage,
    trackSyncProgress
  };
}