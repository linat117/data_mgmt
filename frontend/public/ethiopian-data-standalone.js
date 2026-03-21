// Ethiopian Data Management Script - Standalone Version
// This script can be run directly in the browser console

// Ethiopian Names and Data
const ethiopianNames = {
    firstNames: [
        'Abeba', 'Alemnesh', 'Almaz', 'Aster', 'Bethlehem', 'Birtukan', 'Dawit', 'Eleni', 
        'Fikir', 'Genet', 'Hanna', 'Kidan', 'Lemma', 'Makeda', 'Nahom', 'Rahel', 
        'Saron', 'Tigist', 'Zufan', 'Abel', 'Bekele', 'Daniel', 'Ephrem', 'Fikadu',
        'Girma', 'Habtamu', 'Kassahun', 'Lemma', 'Mekonnen', 'Nahom', 'Samuel', 'Tadesse'
    ],
    lastNames: [
        'Abebe', 'Bekele', 'Demissie', 'Girma', 'Haile', 'Kassa', 'Lemma', 'Mekonnen', 
        'Negash', 'Tesfaye', 'Woldemariam', 'Yohannes', 'Zeleke', 'Alemu', 'Asfaw',
        'Berhanu', 'Chala', 'Desta', 'Fikre', 'Gebre', 'Hailu', 'Jemal', 'Kefale'
    ]
};

const ethiopianRegions = [
    { id: 1, name: 'Addis Ababa', code: 'AA' },
    { id: 2, name: 'Oromia', code: 'OR' },
    { id: 3, name: 'Amhara', code: 'AM' },
    { id: 4, name: 'Tigray', code: 'TG' },
    { id: 5, name: 'Southern Nations', code: 'SN' }
];

const mentorMotherNames = [
    'Almaz Tesfaye', 'Bethlehem Bekele', 'Dawit Girma', 'Eleni Mekonnen', 
    'Fikir Lemma', 'Genet Kassa', 'Hanna Negash', 'Kidan Tesfaye'
];

// Generate random Ethiopian name
const generateEthiopianName = () => {
    const firstName = ethiopianNames.firstNames[Math.floor(Math.random() * ethiopianNames.firstNames.length)];
    const lastName = ethiopianNames.lastNames[Math.floor(Math.random() * ethiopianNames.lastNames.length)];
    return `${firstName} ${lastName}`;
};

// Generate random date in the last 6 months
const generateRecentDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    return date.toISOString().split('T')[0];
};

// Generate client data
const generateClientData = (index) => {
    const region = ethiopianRegions[Math.floor(Math.random() * ethiopianRegions.length)];
    const mentorMother = mentorMotherNames[Math.floor(Math.random() * mentorMotherNames.length)];
    
    return {
        mentor_mother_name: mentorMother,
        date: generateRecentDate(),
        name: generateEthiopianName(),
        age: Math.floor(Math.random() * 40) + 18, // 18-57 years
        sex: Math.random() > 0.5 ? 'F' : 'M',
        folder_number: `CL${String(index + 1).padStart(4, '0')}`,
        address: `${region.name}, Ethiopia`,
        weight: (Math.random() * 30 + 45).toFixed(1), // 45-75 kg
        muac: (Math.random() * 5 + 20).toFixed(1), // 20-25 cm
        identified_problem: Math.random() > 0.5 ? 'Malnutrition signs detected' : 'Routine checkup',
        counseling_given: 'Nutrition counseling provided',
        demonstration_shown: 'Proper feeding techniques demonstrated',
        anything_additional: 'Mother educated on balanced diet',
        problem_faced_by_mm: 'Transportation challenges to reach remote areas',
        total_green_cases: Math.floor(Math.random() * 5) + 1,
        total_blue_cases: Math.floor(Math.random() * 3),
        created_by_region_id: region.id,
        created_by_region_name: region.name,
        created_by_region_code: region.code,
        created_by_email: 'admin@ethiomch.org',
        created_by_name: 'System Admin'
    };
};

// Generate user data
const generateUserData = (index, role) => {
    const region = ethiopianRegions[Math.floor(Math.random() * ethiopianRegions.length)];
    const firstName = ethiopianNames.firstNames[Math.floor(Math.random() * ethiopianNames.firstNames.length)];
    const lastName = ethiopianNames.lastNames[Math.floor(Math.random() * ethiopianNames.lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ethiomch.org`;
    
    return {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: `+2519${Math.floor(Math.random() * 90000000) + 10000000}`, // Ethiopian phone format
        role: role,
        is_active: true,
        region: role !== 'SUPER_ADMIN' ? region.id : null,
        region_name: role !== 'SUPER_ADMIN' ? region.name : null,
        region_code: role !== 'SUPER_ADMIN' ? region.code : null,
        password: 'TempPassword123!'
    };
};

// API helper functions (using correct API endpoints)
const api = {
    get: async (url, options = {}) => {
        try {
            // Use correct API base URL and format
            const fullUrl = `http://localhost:8000/api/v1${url}`;
            console.log(`Fetching: ${fullUrl}`);
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                const text = await response.text();
                console.error(`Got HTML response:`, text);
                throw new Error(`Got HTML instead of JSON from ${fullUrl}`);
            }
            
            const data = await response.json();
            console.log(`Response from ${fullUrl}:`, data);
            return data;
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            throw error;
        }
    },
    post: async (url, data) => {
        try {
            // Use correct API base URL and format
            const fullUrl = `http://localhost:8000/api/v1${url}`;
            console.log(`Posting to: ${fullUrl}`, data);
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                const text = await response.text();
                console.error(`Got HTML response:`, text);
                throw new Error(`Got HTML instead of JSON from ${fullUrl}`);
            }
            
            const result = await response.json();
            console.log(`Response from ${fullUrl}:`, result);
            return result;
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            throw error;
        }
    },
    delete: async (url) => {
        try {
            // Use correct API base URL and format
            const fullUrl = `http://localhost:8000/api/v1${url}`;
            console.log(`Deleting: ${fullUrl}`);
            
            const response = await fetch(fullUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                const text = await response.text();
                console.error(`Got HTML response:`, text);
                throw new Error(`Got HTML instead of JSON from ${fullUrl}`);
            }
            
            const result = await response.json();
            console.log(`Response from ${fullUrl}:`, result);
            return result;
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            throw error;
        }
    }
};

// Clear all existing data
const clearAllData = async () => {
    console.log('🗑️  Clearing existing data...');
    
    try {
        // Clear clients
        const clientsRes = await api.get('/records/clients/');
        const clients = clientsRes.data || clientsRes.results || [];
        console.log(`Found ${clients.length} clients to delete...`);
        
        for (const client of clients) {
            await api.delete(`/records/clients/${client.id}/`);
        }
        
        // Clear users (except current admin)
        const usersRes = await api.get('/users/');
        const users = usersRes.data || usersRes.results || [];
        console.log(`Found ${users.length} users to delete...`);
        
        for (const user of users) {
            if (user.email !== 'admin@ethiomch.org') { // Keep main admin
                await api.delete(`/users/${user.id}/`);
            }
        }
        
        console.log('✅ All existing data cleared!');
        return true;
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        return false;
    }
};

// Create new Ethiopian data
const createEthiopianData = async () => {
    console.log('🇪🇹 Creating Ethiopian test data...');
    
    try {
        // Create 5 client registrations
        console.log('Creating 5 client registrations...');
        for (let i = 0; i < 5; i++) {
            const clientData = generateClientData(i);
            await api.post('/records/clients/', clientData);
            console.log(`✅ Created client: ${clientData.name} (${clientData.folder_number})`);
        }
        
        // Create 5 users (1 Super Admin, 2 PM, 2 Mentor Mothers)
        console.log('Creating 5 users...');
        
        // Super Admin
        const superAdmin = generateUserData(0, 'SUPER_ADMIN');
        await api.post('/users/', superAdmin);
        console.log(`✅ Created Super Admin: ${superAdmin.first_name} ${superAdmin.last_name}`);
        
        // Project Managers
        for (let i = 0; i < 2; i++) {
            const pm = generateUserData(i + 1, 'PM');
            await api.post('/users/', pm);
            console.log(`✅ Created PM: ${pm.first_name} ${pm.last_name} (${pm.region_name})`);
        }
        
        // Mentor Mothers
        for (let i = 0; i < 2; i++) {
            const mm = generateUserData(i + 3, 'MENTOR_MOTHER');
            await api.post('/users/', mm);
            console.log(`✅ Created Mentor Mother: ${mm.first_name} ${mm.last_name} (${mm.region_name})`);
        }
        
        console.log('🎉 Ethiopian test data created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error creating data:', error);
        return false;
    }
};

// Main function to reset and create data
const resetAndCreateEthiopianData = async () => {
    console.log('🚀 Starting Ethiopian data reset and creation...');
    
    const cleared = await clearAllData();
    if (cleared) {
        await createEthiopianData();
        console.log('✨ Process completed! Refresh the page to see new data.');
    }
};

// Export for use in browser console
window.resetAndCreateEthiopianData = resetAndCreateEthiopianData;

console.log('📋 Ethiopian Data Management Loaded!');
console.log('💡 Run: resetAndCreateEthiopianData() in console to reset and create Ethiopian data');
