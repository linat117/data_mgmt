// Simple Ethiopian Data Creation Script - No Auth Required
// This script creates Ethiopian test data without requiring authentication

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

// Simple API functions that don't require auth
const simpleApi = {
    post: async (url, data) => {
        try {
            const fullUrl = `http://localhost:8000/api/v1${url}`;
            console.log(`Posting to: ${fullUrl}`, data);
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error:`, errorText);
                return { success: false, error: errorText };
            }
            
            const result = await response.json();
            console.log(`Response from ${fullUrl}:`, result);
            return { success: true, data: result };
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            return { success: false, error: error.message };
        }
    }
};

// Create Ethiopian data without clearing existing data
const createEthiopianDataOnly = async () => {
    console.log('🇪🇹 Creating Ethiopian test data (no clear)...');
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
        // Create 5 client registrations
        console.log('Creating 5 client registrations...');
        for (let i = 0; i < 5; i++) {
            const clientData = generateClientData(i);
            const result = await simpleApi.post('/records/clients/', clientData);
            
            if (result.success) {
                successCount++;
                console.log(`✅ Created client: ${clientData.name} (${clientData.folder_number})`);
            } else {
                errorCount++;
                console.error(`❌ Failed to create client: ${clientData.name}`, result.error);
            }
        }
        
        // Create 5 users (1 Super Admin, 2 PM, 2 Mentor Mothers)
        console.log('Creating 5 users...');
        
        // Super Admin
        const superAdmin = generateUserData(0, 'SUPER_ADMIN');
        const saResult = await simpleApi.post('/users/', superAdmin);
        if (saResult.success) {
            successCount++;
            console.log(`✅ Created Super Admin: ${superAdmin.first_name} ${superAdmin.last_name}`);
        } else {
            errorCount++;
            console.error(`❌ Failed to create Super Admin: ${superAdmin.email}`, saResult.error);
        }
        
        // Project Managers
        for (let i = 0; i < 2; i++) {
            const pm = generateUserData(i + 1, 'PM');
            const pmResult = await simpleApi.post('/users/', pm);
            if (pmResult.success) {
                successCount++;
                console.log(`✅ Created PM: ${pm.first_name} ${pm.last_name} (${pm.region_name})`);
            } else {
                errorCount++;
                console.error(`❌ Failed to create PM: ${pm.email}`, pmResult.error);
            }
        }
        
        // Mentor Mothers
        for (let i = 0; i < 2; i++) {
            const mm = generateUserData(i + 3, 'MENTOR_MOTHER');
            const mmResult = await simpleApi.post('/users/', mm);
            if (mmResult.success) {
                successCount++;
                console.log(`✅ Created Mentor Mother: ${mm.first_name} ${mm.last_name} (${mm.region_name})`);
            } else {
                errorCount++;
                console.error(`❌ Failed to create Mentor Mother: ${mm.email}`, mmResult.error);
            }
        }
        
        console.log(`🎉 Ethiopian data creation completed! Success: ${successCount}, Errors: ${errorCount}`);
        return { success: successCount > 0, errorCount };
        
    } catch (error) {
        console.error('❌ Error creating Ethiopian data:', error);
        return { success: false, error: error.message };
    }
};

// Export for use in browser console
window.createEthiopianDataOnly = createEthiopianDataOnly;

console.log('📋 Simple Ethiopian Data Creation Loaded!');
console.log('💡 Run: createEthiopianDataOnly() in console to create Ethiopian data without clearing');
