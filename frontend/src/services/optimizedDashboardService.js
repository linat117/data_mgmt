import { getDashboardStats } from './dashboardService';
import { getAllClients, getAllReports, getAllPlans } from './recordService';

export const getDashboardData = async (regionFilter = '') => {
  const [statsRes, clientsRes, reportsRes, plansRes] = await Promise.all([
    getDashboardStats(),
    getAllClients(),
    getAllReports(), 
    getAllPlans()
  ]);
  
  const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];
  const reports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
  const plans = Array.isArray(plansRes.data) ? plansRes.data : [];
  
  // Get all regions from mentor mother names (they include region info)
  const allRegions = [...new Set(clients.map(c => c.mentor_mother_name).filter(Boolean))];
  
  // Filter by mentor mother name (which includes region) if specified
  const filteredClients = regionFilter 
    ? clients.filter(c => c.mentor_mother_name && c.mentor_mother_name.includes(regionFilter))
    : clients;
  const filteredReports = regionFilter
    ? reports.filter(r => r.mentor_mother_name && r.mentor_mother_name.includes(regionFilter))
    : reports;
  const filteredPlans = regionFilter
    ? plans.filter(p => p.mentor_mother_name && p.mentor_mother_name.includes(regionFilter))
    : plans;
  
  return {
    stats: statsRes.data,
    clients: filteredClients,
    reports: filteredReports,
    plans: filteredPlans,
    allRegions
  };
};

export const processChartData = (data) => {
  const { clients, reports, plans } = data;
  
  const clientTotals = clients.reduce(
    (acc, c) => {
      acc.green += Number(c.total_green_cases) || 0;
      acc.blue += Number(c.total_blue_cases) || 0;
      return acc;
    },
    { green: 0, blue: 0 }
  );

  const mchTotals = reports.reduce(
    (acc, r) => {
      acc.green += Number(r.total_green) || 0;
      acc.blue += Number(r.total_blue) || 0;
      return acc;
    },
    { green: 0, blue: 0 }
  );

  const dayOrder = ['Wixata', 'Kibxata', 'Roobi', 'Kamisa', 'Jimaata'];
  const plansByDayMap = plans.reduce((acc, p) => {
    const day = p.day_of_week || 'Other';
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const plansByDay = dayOrder.map((day) => ({
    name: day,
    count: plansByDayMap[day] || 0,
  }));

  // Process age distribution
  const ageDistribution = clients.reduce((acc, client) => {
    const age = Number(client.age);
    if (isNaN(age) || age < 0) return acc;
    
    let ageGroup;
    if (age < 5) ageGroup = '0-4';
    else if (age < 10) ageGroup = '5-9';
    else if (age < 15) ageGroup = '10-14';
    else if (age < 20) ageGroup = '15-19';
    else if (age < 25) ageGroup = '20-24';
    else if (age < 30) ageGroup = '25-29';
    else if (age < 35) ageGroup = '30-34';
    else if (age < 40) ageGroup = '35-39';
    else if (age < 45) ageGroup = '40-44';
    else if (age < 50) ageGroup = '45-49';
    else if (age < 55) ageGroup = '50-54';
    else if (age < 60) ageGroup = '55-59';
    else ageGroup = '60+';
    
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageDistributionData = Object.keys(ageDistribution)
    .sort((a, b) => {
      if (a === '60+') return 1;
      if (b === '60+') return -1;
      return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]);
    })
    .map(ageGroup => ({
      ageGroup,
      count: ageDistribution[ageGroup]
    }));

  return {
    clients: clientTotals,
    mch: mchTotals,
    plansByDay,
    ageDistribution: ageDistributionData,
    counts: { 
      mchReports: reports.length, 
      clients: clients.length, 
      plans: plans.length 
    }
  };
};
