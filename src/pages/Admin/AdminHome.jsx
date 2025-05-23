import React, { useEffect, useState } from 'react';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import '../../Styles/Admin/AdminSidebar.css';

function AdminHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  
  const baseURL = import.meta.env.VITE_API_BASEURL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Basic metrics
        const metricsResponse = await axios.get(`${baseURL}/dashboard/home/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCounts(metricsResponse.data);
        
        // Get recent jobs
        const jobsResponse = await axios.get(`${baseURL}/dashboard/admin/jobs/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { active: true, limit: 5 }
        });
        setRecentJobs(jobsResponse.data);
        
        // Get pending employers that need approval
        const employersResponse = await axios.get(`${baseURL}/dashboard/elist/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pending = employersResponse.data
          .filter(employer => !employer.is_approved_by_admin)
          .slice(0, 5)
          .map(employer => ({
            id: employer.id,
            name: employer.user_name, 
            email: employer.email,
          }));
        
        setPendingEmployers(pending);

        // Get user growth data
        const growthResponse = await axios.get(`${baseURL}/dashboard/user-growth/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { days: timeRange }
        });
        setUserGrowthData(growthResponse.data);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [baseURL, token, timeRange]);

  const handleApproveEmployer = async (employerId) => {
    try {
      await axios.post(`${baseURL}/dashboard/api/employer/approval/`, {
        id: employerId,
        action: 'approve'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update pending employers list
      setPendingEmployers(pendingEmployers.filter(emp => emp.id !== employerId));
      
      // Update counts
      if (counts) {
        setCounts({
          ...counts,
          employers_count: counts.employers_count + 1
        });
      }
    } catch (error) {
      console.error('Error approving employer:', error);
      alert('Failed to approve employer. Please try again.');
    }
  };

  const getActivityStats = () => {
    if (!counts) return [];
    
    return [
      { name: 'Jobs', value: counts.jobs_count || 0 },
      { name: 'Candidates', value: counts.candidates_count || 0 },
      { name: 'Employers', value: counts.employers_count || 0 }
    ];
  };

  const timeRangeOptions = [
    { value: 7, label: 'Last 7 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 90 Days' }
  ];

  const quickActions = [
   
    { title:  'Employers', icon: '👔', link: '/admin/elist' },
    { title: 'View Candidates', icon: '👥', link: '/admin/clist' },
    { title: 'Reports', icon: '📊', link: '/admin/reports' }
  ];

  if (isLoading) {
    return (
      <div className="admin-home-page">
        <div className="admin-sidebar-wrapper">
          <Sidebar />
        </div>
        <div className="admin-content-wrapper">
          <div className="admin-loading">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-home-page" style={{marginTop:0}}>
      <div className="admin-sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="admin-content-wrapper">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-title">Candidates</div>
            <div className="admin-stat-value">{counts?.candidates_count || 0}</div>
            <div className="admin-stat-icon candidate-icon">👥</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">Employers</div>
            <div className="admin-stat-value">{counts?.employers_count || 0}</div>
            <div className="admin-stat-icon employer-icon">🏢</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">Active Jobs</div>
            <div className="admin-stat-value">{counts?.jobs_count || 0}</div>
            <div className="admin-stat-icon job-icon">💼</div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-title">Pending Approvals</div>
            <div className="admin-stat-value">{pendingEmployers.length}</div>
            <div className="admin-stat-icon pending-icon">⏳</div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="admin-section">
          <h2 className="admin-section-title">Quick Actions</h2>
          <div className="admin-quick-actions">
            {quickActions.map((action, index) => (
              <a key={index} href={action.link} className="admin-quick-action-card">
                <div className="admin-quick-action-icon">{action.icon}</div>
                <div className="admin-quick-action-title">{action.title}</div>
              </a>
            ))}
          </div>
        </div>
        
       
             
          
          {/* Activity Overview */}
          <div className="admin-chart-card">
            <h2 className="admin-section-title">Activity Overview</h2>
            <div className="admin-chart-container">
              {counts ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getActivityStats()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getActivityStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-no-data">No activity data available</div>
              )}
            </div>
          </div>
       
        
        {/* Tables Row */}
        <div className="admin-section admin-tables-row">
          {/* Recent Jobs */}
          <div className="admin-table-card">
            <h2 className="admin-section-title">Latest Jobs</h2>
            {recentJobs.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      
                      <td>
                        <span className={`admin-status admin-status-${job.active ? 'active' : 'inactive'}`}>
                          {job.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-no-data">No recent jobs available</div>
            )}
            <div className="admin-view-all">
              <a href="/admin/jobList">View All Jobs →</a>
            </div>
          </div>
          
          {/* Pending Approvals */}
          <div className="admin-table-card">
            <h2 className="admin-section-title">Pending Employer Approvals</h2>
            {pendingEmployers.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEmployers.map((employer) => (
                    <tr key={employer.id}>
                      <td>{employer.name}</td>
                      <td>{employer.email}</td>
                      <td>
                        <button 
                          className="admin-approve-btn"
                          onClick={() => handleApproveEmployer(employer.id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-no-data">No pending approvals</div>
            )}
            <div className="admin-view-all">
              <a href="/admin/elist">View All Employers →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;