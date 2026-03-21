// Database Verification Script
// Check what's actually stored in the database

const checkDatabaseData = async () => {
    console.log('🔍 Checking database contents...');
    
    try {
        // Check clients
        console.log('📋 Checking clients...');
        const clientsResponse = await fetch('http://localhost:8000/api/v1/records/clients/');
        const clientsData = await clientsResponse.json();
        console.log(`Found ${clientsData.length || 0} clients in database:`, clientsData);
        
        if (clientsData.length > 0) {
            console.log('First 3 clients:');
            clientsData.slice(0, 3).forEach((client, index) => {
                console.log(`${index + 1}. ${client.name} (${client.folder_number}) - ${client.mentor_mother_name} - ${client.created_by_email}`);
            });
        }
        
        // Check users
        console.log('👥 Checking users...');
        const usersResponse = await fetch('http://localhost:8000/api/v1/users/');
        const usersData = await usersResponse.json();
        console.log('Found ' + (usersData.length || 0) + ' users in database: ', usersData);
        
        if (usersData.length > 0) {
            console.log('First 5 users:');
            usersData.slice(0, 5).forEach((user, index) => {
                console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ${user.role} - ${user.region_name || 'No region'}`);
            });
        }
        
        // Check for Ethiopian names
        const ethiopianClients = clientsData.filter(c => 
            ethiopianNames.firstNames.some(name => 
                c.name && c.name.toLowerCase().includes(name.toLowerCase())
            ) || ethiopianNames.lastNames.some(name => 
                c.name && c.name.toLowerCase().includes(name.toLowerCase())
            )
        );
        
        const ethiopianUsers = usersData.filter(u => 
            ethiopianNames.firstNames.some(name => 
                u.first_name && u.first_name.toLowerCase()includes(name.toLowerCase())
            ) || ethiopianNames.lastNames.some(name => 
                u.last_name && u.last_name.toLowerCase().includes(name.toLowerCase())
            )
        );
        
        console.log(`🇪🇹 Ethiopian clients found: ${ethiopianClients.length}`);
        console.log(`🇪🇹 Ethiopian users found: ${ethiopianUsers.length}`);
        
        return {
            totalClients: clientsData.length || 0,
            totalUsers: usersData.length || 0,
            ethiopianClients: ethiopianClients.length,
            ethiopianUsers: ethiopianUsers.length,
            clients: clientsData,
            users: usersData
        };
        
    } catch (error) {
        console.error('❌ Error checking database:', error);
        return null;
    }
};

// Export for browser console
window.checkDatabaseData = checkDatabaseData;

console.log('🔍 Database Verification Loaded!');
console.log('Run: checkDatabaseData() in console to see what\'s actually stored');
