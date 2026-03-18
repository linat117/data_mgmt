import { getDashboardStats } from './dashboardService';
import { getAllClients, getAllReports, getAllPlans } from './recordService';

export const getDashboardData = async () => {
  const [statsRes, clientsRes, reportsRes, plansRes] = await Promise.all([
    getDashboardStats(),
    getAllClients(),
    getAllReports(), 
    getAllPlans()
  ]);
  
  return {
    stats: statsRes.data,
    clients: Array.isArray(clientsRes.data) ? clientsRes.data : [],
    reports: Array.isArray(reportsRes.data) ? reportsRes.data : [],
    plans: Array.isArray(plansRes.data) ? plansRes.data : []
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

  return {
    clients: clientTotals,
    mch: mchTotals,
    plansByDay,
    counts: { 
      mchReports: reports.length, 
      clients: clients.length, 
      plans: plans.length 
    }
  };
};
