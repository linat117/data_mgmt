// Clean Ethiopian Data Setup
// Remove all old data and keep only the 5 Ethiopian users and 5 Ethiopian clients

const cleanEthiopianSetup = async () => {
    console.log('🧹 Starting clean Ethiopian data setup...');
    
    try {
        // Get current token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.log('❌ No token found. Please login first.');
            return;
        }
        
        const api = {
            get: async (url) => {
                const response = await fetch(`http://localhost:8000/api/v1${url}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return response.json();
            },
            delete: async (url) => {
                const response = await fetch(`http://localhost:8000/api/v1${url}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return response.json();
            },
            post: async (url, data) => {
                const response = await fetch(`http://localhost:8000/api/v1${url}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                return response.json();
            }
        };
        
        // Step 1: Get all current data
        console.log('📊 Checking current data...');
        
        const allClients = await api.get('/records/clients/');
        const allUsers = await api.get('/users/');
        
        console.log(`Found ${allClients.length || 0} clients`);
        console.log(`Found ${allUsers.length || 0} users`);
        
        // Step 2: Identify Ethiopian vs non-Ethiopian data
        const ethiopianNames = [
            'Makeda', 'Tigist', 'Hanna', 'Nahom', 'Kassahun',
            'Lemma', 'Nahom', 'Ephrem', 'Dawit', 'Abel'
        ];
        
        const ethiopianClients = allClients.filter(client => 
            ethiopianNames.some(name => 
                client.name && client.name.toLowerCase().includes(name.toLowerCase())
            )
        );
        
        const ethiopianUsers = allUsers.filter(user => 
            ethiopianNames.some(name => 
                (user.first_name && user.first_name.toLowerCase().includes(name.toLowerCase())) ||
                (user.last_name && user.last_name.toLowerCase().includes(name.toLowerCase()))
            )
        );
        
        console.log(`🇪🇹 Ethiopian clients to keep: ${ethiopianClients.length}`);
        console.log(`🇪🇹 Ethiopian users to keep: ${ethiopianUsers.length}`);
        
        // Step 3: Delete non-Ethiopian data
        console.log('🗑️  Removing non-Ethiopian data...');
        
        // Delete non-Ethiopian clients
        const nonEthiopianClients = allClients.filter(client => 
            !ethiopianClients.some(ethiopian => ethiopian.id === client.id)
        );
        
        for (const client of nonEthiopianClients) {
            try {
                await api.delete(`/records/clients/${client.id}/`);
                console.log(`✅ Deleted client: ${client.name}`);
            } catch (error) {
                console.log(`❌ Failed to delete client ${client.name}:`, error);
            }
        }
        
        // Delete non-Ethiopian users (except the current logged-in user)
        const currentUserId = JSON.parse(localStorage.getItem('auth-storage')).state.user.user_id;
        const nonEthiopianUsers = allUsers.filter(user => 
            !ethiopianUsers.some(ethiopian => ethiopian.id === user.id) &&
            user.id !== currentUserId
        );
        
        for (const user of nonEthiopianUsers) {
            try {
                await api.delete(`/users/${user.id}/`);
                console.log(`✅ Deleted user: ${user.email}`);
            } catch (error) {
                console.log(`❌ Failed to delete user ${user.email}:`, error);
            }
        }
        
        // Step 4: Verify clean setup
        console.log('🔍 Verifying clean setup...');
        
        const finalClients = await api.get('/records/clients/');
        const finalUsers = await api.get('/users/');
        
        console.log(`✅ Clean setup complete!`);
        console.log(`📊 Final clients: ${finalClients.length}`);
        console.log(`👥 Final users: ${finalUsers.length}`);
        
        // Show remaining data
        console.log('\n🇪🇹 Remaining Ethiopian Clients:');
        finalClients.forEach((client, index) => {
            console.log(`${index + 1}. ${client.name} (${client.folder_number})`);
        });
        
        console.log('\n🇪🇹 Remaining Ethiopian Users:');
        finalUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
        });
        
        console.log('\n🎉 Clean Ethiopian setup completed! Refresh your browser to see the clean data.');
        
    } catch (error) {
        console.error('❌ Error during clean setup:', error);
    }
};

// Export for browser console
window.cleanEthiopianSetup = cleanEthiopianSetup;

console.log('🧹 Clean Ethiopian Data Setup Loaded!');
console.log('💡 Run: cleanEthiopianSetup() in console to remove old data and keep only Ethiopian data');
