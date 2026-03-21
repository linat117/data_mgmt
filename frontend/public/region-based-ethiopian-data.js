// Region-Based Ethiopian Data Creation
// Creates clients with unique region-based folder numbers

const ethiopianRegions = [
    { id: 1, name: 'Addis Ababa', code: 'AA' },
    { id: 2, name: 'Oromia', code: 'OR' },
    { id: 3, name: 'Amhara', code: 'AM' },
    { id: 4, name: 'Tigray', code: 'TG' },
    { id: 5, name: 'Southern Nations', code: 'SN' }
];

const ethiopianNames = {
    firstNames: [
        'Makeda', 'Almaz', 'Alemnesh', 'Bethlehem', 'Saron', 'Tigist', 'Hanna', 'Kidan', 
        'Lemma', 'Nahom', 'Rahel', 'Genet', 'Dawit', 'Fikir', 'Zufan', 'Abeba', 'Bekele',
        'Demissie', 'Girma', 'Haile', 'Kassahun', 'Mekonnen', 'Negash', 'Tesfaye', 'Woldemariam'
    ],
    lastNames: [
        'Asfaw', 'Lemma', 'Fikre', 'Girma', 'Bekele', 'Demissie', 'Gebre', 'Kassa', 'Lemma', 'Mekonnen',
        'Negash', 'Tesfaye', 'Woldemariam', 'Zeleke', 'Asfaw', 'Berhanu', 'Chala', 'Desta'
    ]
};

const mentorMotherNames = [
    'Almaz Tesfaye', 'Bethlehem Bekele', 'Dawit Girma', 'Eleni Mekonnen', 
    'Fikir Lemma', 'Genet Demissie', 'Hanna Negash', 'Kidan Tesfaye'
];

// Generate random Ethiopian name
const generateEthiopianName = () => {
    const firstName = ethiopianNames.firstNames[Math.floor(Math.random() * ethiopianNames.firstNames.length)];
    const lastName = ethiopianNames.lastNames[Math.floor(Math.random() * ethiopianNames.lastNames.length)];
    return `${firstName} ${lastName}`;
};

// Generate random date in last 6 months
const generateRecentDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    return date.toISOString().split('T')[0];
};

// Generate client data with region-based folder number
const generateClientData = (index) => {
    const region = ethiopianRegions[index % ethiopianRegions.length];
    const mentorMother = mentorMotherNames[Math.floor(Math.random() * mentorMotherNames.length)];
    const folderNumber = `${region.code}_${String(index + 1).padStart(3, '0')}`;
    
    return {
        mentor_mother_name: mentorMother,
        date: generateRecentDate(),
        name: generateEthiopianName(),
        age: Math.floor(Math.random() * 40) + 18, // 18-57 years
        sex: Math.random() > 0.5 ? 'F' : 'M',
        folder_number: folderNumber,
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
    const region = ethiopianRegions[index % ethiopianRegions.length];
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

// API helper with authentication
const api = {
    post: async (url, data) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token');
            }
            
            const fullUrl = `http://localhost:8000/api/v1${url}`;
            console.log(`Creating: ${fullUrl}`, data);
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log(`Response: ${result.status || response.status}`, result);
            return result;
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            return { success: false, error: error.message };
        }
    }
};

// Create Ethiopian data with region-based folder numbers
const createRegionBasedEthiopianData = async () => {
    console.log('🇪🇹 Creating Ethiopian data with region-based folder numbers...');
    
    try {
        // Create 5 client registrations with unique region-based folder numbers
        console.log('Creating 5 client registrations...');
        for (let i = 0; i < 5; i++) {
            const clientData = generateClientData(i);
            const result = await api.post('/records/clients/', clientData);
            
            if (result.id || result.success) {
                console.log(`✅ Created client: ${clientData.name} (${clientData.folder_number}) - ${clientData.address}`);
            } else {
                console.log(`❌ Failed to create client: ${clientData.name}`, result.error);
            }
        }
        
        // Create 5 users (1 Super Admin, 2 PM, 2 Mentor Mothers)
        console.log('Creating 5 users...');
        
        const userRoles = ['SUPER_ADMIN', 'PM', 'PM', 'MENTOR_MOTHER', 'MENTOR_MOTHER'];
        for (let i = 0; i < 5; i++) {
            const userData = generateUserData(i, userRoles[i]);
            const result = await api.post('/users/', userData);
            
            if (result.id || result.success) {
                console.log(`✅ Created user: ${userData.first_name} ${userData.last_name} (${userData.email}) - ${userData.role} - ${userData.region_name || 'All Regions'}`);
            } else {
                console.log(`❌ Failed to create user: ${userData.email}`, result.error);
            }
        }
        
        console.log('🎉 Region-based Ethiopian data creation completed!');
        console.log('📊 Folder numbers: AA_001, OR_001, AM_001, TG_001, SN_001');
        console.log('🔄 Refresh your browser to see the new data!');
        
    } catch (error) {
        console.error('❌ Error creating Ethiopian data:', error);
    }
};

// Export for browser console
window.createRegionBasedEthiopianData = createRegionBasedEthiopianData;

console.log('🇪🇹 Region-Based Ethiopian Data Creation Loaded!');
console.log('💡 Run: createRegionBasedEthiopianData() in console to create Ethiopian data with unique region-based folder numbers');
