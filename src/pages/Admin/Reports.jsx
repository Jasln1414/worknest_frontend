import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';
import axios from 'axios';
import { Box, Typography, Tabs, Tab, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import Papa from 'papaparse';
import '../../Styles/Admin/AdminSidebar.css';
import { timeRangeOptions } from '../../Components/admin/utilities/timeRangeOptions';

function Reports() {
  const baseURL = import.meta.env.VITE_API_BASEURL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  const [userGrowthData, setUserGrowthData] = useState([]);
  const [timeRange, setTimeRange] = useState(2025);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [sales, setSales] = useState([]);


  useEffect(()=>{
    getSalesReport();
    getSubscriptionGrowthReport(timeRange);
  },[])

  const getSubscriptionGrowthReport = async (timeRange) => {
    try {
      const response = await axios.get(`${baseURL}/dashboard/subscription-growth/`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          params: {
            year: timeRange,  // <-- Pass year as query param
          },
      });
      console.log('Subscription Growth Report:', response.data);

   const transformedData = Object.keys(response.data).map(monthKey => ({
      month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
      no_employers: response.data[monthKey].no_employers,
      payments: response.data[monthKey].payments,
    }));

    console.log('Transformed Data:', transformedData);

    setUserGrowthData(transformedData);
      
    } catch (error) {
      console.error('Error fetching subscription growth report:', error);
    }
  };

  const handleTimePeriodChange = (selectedValue) => {
    setTimeRange(selectedValue);  // Update state with selected value
    getSubscriptionGrowthReport(selectedValue);  // Trigger API call
    console.log('Selected Time Period:', selectedValue);
  };

  const getSalesReport = async ()=>{
    try{
      const response = await axios.get(`${baseURL}/dashboard/salesReport/`,{  headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }});
      
      console.log('Sales Report:', response.data.sales);
      if (response.status === 200) {
        setTotalRevenue(response.data.total_revenue);
        setActiveSubscribers(response.data.total_subscribers);
        setTotalPlans(response.data.total_plans);
        setTotalSubscribers(response.data.activeSubscribers);
        setSales(response.data.sales);
        
      }
    }
    catch (error){
      console.error('Error fetching sales report:', error);
    }
  };

const subscriptions = [
  {
    id: 1,
    employer: 'ABC Pvt Ltd',
    plan: 'Premium',
    start_date: '2025-05-01',
    end_date: '2025-06-01',
    transaction_id: 'TXN12345',
    status: 'active',
    payment: 5000,
  },
  // More entries...
];

  return (
    <div className="ccl-content-wrapper">
      <Sidebar />
      <div className="ccl-main-content">
        <div className="ccl-page-header">
          <Typography variant="h4">Reports</Typography>
        </div>
        <div className="ccl-table-container">
          
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Total revenue</span>
            </div>
            <div className="admin-stat-value">
              <span>{totalRevenue}</span>
            </div>
            <div className="admin-stat-icon candidate-icon">👥</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Subscription plans</span>
            </div>
            <div className="admin-stat-value">
              <span>{totalPlans}</span>
            </div>
            <div className="admin-stat-icon employer-icon">🏢</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Active Subscribers</span>
            </div>
            <div className="admin-stat-value">
              <span>{activeSubscribers}</span>
            </div>
            <div className="admin-stat-icon job-icon">💼</div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-title">
            <span>Total Subscribers</span>
            </div>
            <div className="admin-stat-value">
              <span>{totalSubscribers}</span>
            </div>
            <div className="admin-stat-icon pending-icon">⏳</div>
          </div>
        </div>
         
        </div>
         {/* Charts Row */}
        <div className="admin-section admin-charts-row">
          {/* User Growth Chart */}
          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h2 className="admin-section-title">Subscription growth</h2>
              <select 
                className="admin-time-range-select"
                value={timeRange}
                onChange={(e) => handleTimePeriodChange(Number(e.target.value))}  // Update state on change
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-chart-container">
              {userGrowthData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" /> {/* <-- Use 'month' key */}
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="no_employers" stroke="#82ca9d" name="Employers" />
                    <Line type="monotone" dataKey="payments" stroke="#8884d8" name="Payments" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-no-data">No growth data available</div>
              )}
            </div>
          </div>
        </div>
        {/* Subscription Table Section */}
      <div className="admin-section admin-subscription-table">
        <h2 className="admin-section-title">Employer Subscriptions History</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employer</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr >
                    <td>{sale.employer.user_name}</td>
                    <td>{sale.plan.name}</td>
                    <td>{sale.start_date ? sale.start_date.slice(0, 10) : 'N/A'}</td>
                    <td>{sale.end_date ? sale.end_date.slice(0, 10) : 'N/A'}</td>
                    <td>{sale.payment.transaction_id || 'N/A'}</td>
                    <td>{sale.status}</td>
                    <td>₹{sale.payment.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="admin-no-data">
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Reports;