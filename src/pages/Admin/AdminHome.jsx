import React, { useEffect, useState } from 'react';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import '../../Styles/Admin/AdminSidebar.css';

function AdminHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  
  const baseURL = import.meta.env.VITE_API_BASEURL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Basic metrics
        const metricsResponse = await axios.get(`${baseURL}/dashboard/home/`);
        setCounts(metricsResponse.data);
        
        // Get recent jobs
        try {
          const jobsResponse = await axios.get(`${baseURL}/dashboard/admin/jobs/`, {
            params: { active: true, limit: 5 }
          });
          setRecentJobs(jobsResponse.data);
        } catch (error) {
          console.error('Error fetching jobs:', error);
          setRecentJobs([]);
        }
        
        // Get pending employers that need approval
        try {
          const employersResponse = await axios.get(`${baseURL}/dashboard/elist/`);
          const pendingEmployers = employersResponse.data.filter(employer => 
            !employer.is_approved_by_admin
          ).slice(0, 5);
          setPendingEmployers(pendingEmployers);
        } catch (error) {
          console.error('Error fetching employers:', error);
          setPendingEmployers([]);
        }
        
        // Since the reports endpoints don't exist yet, we'll use mock data
        // Mock user growth data
        const mockGrowthData = generateMockGrowthData(timeRange);
        setUserGrowthData(mockGrowthData);
        
        // Mock application stats
        const mockAppStats = generateMockApplicationStats();
        setApplicationStats(mockAppStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Generate mock data for user growth
    const generateMockGrowthData = (days) => {
      const data = [];
      const today = new Date();
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate some realistic looking growth data
        // Base numbers that increase over time with some randomness
        const baseCandidate = 50 + Math.floor((days - i) * 2.5);
        const baseEmployer = 10 + Math.floor((days - i) * 0.8);
        
        // Add some randomness (± 10%)
        const candidateRandom = Math.floor(baseCandidate * (0.9 + Math.random() * 0.2));
        const employerRandom = Math.floor(baseEmployer * (0.9 + Math.random() * 0.2));
        
        data.push({
          date: date.toLocaleDateString(),
          candidate_count: candidateRandom,
          employer_count: employerRandom
        });
      }
      
      return data;
    };
    
    // Generate mock data for application stats
    const generateMockApplicationStats = () => {
      const jobTitles = [
        'Software Developer', 
        'Marketing Manager', 
        'Data Analyst', 
        'Product Manager', 
        'UI/UX Designer',
        'Sales Representative',
        'Project Manager',
        'Customer Support'
      ];
      
      return jobTitles.map(title => ({
        job_title: title,
        application_count: Math.floor(Math.random() * 100) + 10
      }));
    };
    
    fetchDashboardData();
  }, [baseURL, timeRange]);

  const handleApproveEmployer = async (employerId) => {
    try {
      await axios.post(`${baseURL}/dashboard/api/employer/approval/`, {
        id: employerId,
        action: 'approve'
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

  // Get activity stats for the "Activity Overview" card
  const getActivityStats = () => {
    if (!applicationStats || applicationStats.length === 0) return [];
    
    const totalApplications = applicationStats.reduce((sum, item) => sum + item.application_count, 0);
    
    return [
      { name: 'Applications', value: totalApplications },
      { name: 'Jobs', value: counts?.jobs_count || 0 },
      { name: 'Candidates', value: counts?.candidates_count || 0 },
      { name: 'Employers', value: counts?.employers_count || 0 }
    ];
  };

  const timeRangeOptions = [
    { value: 7, label: 'Last 7 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 90 Days' }
  ];

  // Quick actions
  const quickActions = [
    { title: 'Review Jobs', icon: '📋', link: '/admin/jobs' },
    { title: 'Approve Employers', icon: '👔', link: '/admin/employers' },
    { title: 'View Candidates', icon: '👥', link: '/admin/candidates' },
    { title: 'View Reports', icon: '📊', link: '/admin/reports' }
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
    <div className="admin-home-page "style={{marginTop:0}}>
      <div className="admin-sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="admin-content-wrapper">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Candidates</span>
            </div>
            <div className="admin-stat-value">
              <span>{counts ? counts.candidates_count : "N/A"}</span>
            </div>
            <div className="admin-stat-icon candidate-icon">👥</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Employers</span>
            </div>
            <div className="admin-stat-value">
              <span>{counts ? counts.employers_count : "N/A"}</span>
            </div>
            <div className="admin-stat-icon employer-icon">🏢</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Active Jobs</span>
            </div>
            <div className="admin-stat-value">
              <span>{counts ? counts.jobs_count : "N/A"}</span>
            </div>
            <div className="admin-stat-icon job-icon">💼</div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-title">
              <span>Pending Approvals</span>
            </div>
            <div className="admin-stat-value">
              <span>{pendingEmployers.length}</span>
            </div>
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
        
        {/* Charts Row */}
        <div className="admin-section admin-charts-row">
          {/* User Growth Chart */}
          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h2 className="admin-section-title">User Growth</h2>
              <select 
                className="admin-time-range-select"
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-chart-container">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="candidate_count" stroke="#8884d8" name="Candidates" />
                    <Line type="monotone" dataKey="employer_count" stroke="#82ca9d" name="Employers" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-no-data">No growth data available</div>
              )}
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
                    <th>Company</th>
                    <th>Date Posted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.company_name}</td>
                      <td>{new Date(job.posted_date).toLocaleDateString()}</td>
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
              <a href="/admin/jobs">View All Jobs →</a>
            </div>
          </div>
          
          {/* Pending Approvals */}
          <div className="admin-table-card">
            <h2 className="admin-section-title">Pending Employer Approvals</h2>
            {pendingEmployers.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEmployers.map((employer) => (
                    <tr key={employer.id}>
                      <td>{employer.company_name}</td>
                      <td>{employer.email}</td>
                      <td>{new Date(employer.created_at).toLocaleDateString()}</td>
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
              <a href="/admin/employers">View All Employers →</a>
            </div>
          </div>
        </div>
        
        {/* Top Jobs by Applications */}
        <div className="admin-section">
          <h2 className="admin-section-title">Top Jobs by Applications</h2>
          <div className="admin-chart-container admin-full-width-chart">
            {applicationStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationStats.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="job_title" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="application_count" fill="#8884d8" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="admin-no-data">No application statistics available</div>
            )}
          </div>
          <div className="admin-view-all">
            <a href="/admin/reports">View All Reports →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;