import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';
import axios from 'axios';
import { Box, Grid, Card, CardContent, Typography, Tabs, Tab, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Papa from 'papaparse';
import '../../Styles/Admin/AdminSidebar.css';

function AdminHome() {
  const baseURL = import.meta.env.VITE_API_BASEURL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  // State for metrics
  const [metrics, setMetrics] = useState({
    candidates_count: 0,
    employers_count: 0,
    jobs_count: 0,
  });

  // State for reports
  const [reportTab, setReportTab] = useState(0);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [jobTrendData, setJobTrendData] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [daysFilter, setDaysFilter] = useState(30);

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/home/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, [baseURL, token]);

  // Fetch report data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // User Growth
        const userGrowthRes = await axios.get(`${baseURL}/api/reports/user-growth/`, {
          params: { days: daysFilter },
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserGrowthData(
          userGrowthRes.data.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(),
          }))
        );

        // Job Trends
        const jobTrendRes = await axios.get(`${baseURL}/api/reports/job-trends/`, {
          params: { days: daysFilter },
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobTrendData(
          jobTrendRes.data.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(),
          }))
        );

        // Application Stats
        const appStatsRes = await axios.get(`${baseURL}/api/reports/application-stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplicationStats(appStatsRes.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, [baseURL, token, daysFilter]);

  // CSV Export
  const handleExportCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ccl-content-wrapper">
      <Sidebar />
      <div className="ccl-main-content">
        <div className="ccl-page-header">
          <Typography variant="h4">Dashboard</Typography>
        </div>

        {/* Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card className="ccl-card">
                <CardContent>
                  <Typography variant="h6" className="ccl-card-title">Candidates</Typography>
                  <Typography variant="h4" className="ccl-card-value">
                    {metrics.candidates_count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card className="ccl-card">
                <CardContent>
                  <Typography variant="h6" className="ccl-card-title">Employers</Typography>
                  <Typography variant="h4" className="ccl-card-value">
                    {metrics.employers_count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card className="ccl-card">
                <CardContent>
                  <Typography variant="h6" className="ccl-card-title">Active Jobs</Typography>
                  <Typography variant="h4" className="ccl-card-value">
                    {metrics.jobs_count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Reports Section */}
        <div className="ccl-table-container">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Tabs value={reportTab} onChange={(e, newValue) => setReportTab(newValue)}>
              <Tab label="User Growth" />
              <Tab label="Job Trends" />
              <Tab label="Application Stats" />
            </Tabs>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={daysFilter}
                onChange={(e) => setDaysFilter(e.target.value)}
                label="Time Range"
              >
                <MenuItem value={7}>Last 7 Days</MenuItem>
                <MenuItem value={30}>Last 30 Days</MenuItem>
                <MenuItem value={90}>Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {reportTab === 0 && (
            <Box>
              <Typography variant="h6" className="ccl-section-title">
                User Growth Over Time
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleExportCSV(userGrowthData, 'user_growth.csv')}
                className="ccl-export-button"
                sx={{ mb: 2 }}
              >
                Export CSV
              </Button>
              <ResponsiveContainer width="100%" height={400}>
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
            </Box>
          )}

          {reportTab === 1 && (
            <Box>
              <Typography variant="h6" className="ccl-section-title">
                Job Posting Trends
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleExportCSV(jobTrendData, 'job_trends.csv')}
                className="ccl-export-button"
                sx={{ mb: 2 }}
              >
                Export CSV
              </Button>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={jobTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="job_count" stroke="#8884d8" name="Total Jobs" />
                  <Line type="monotone" dataKey="active_job_count" stroke="#82ca9d" name="Active Jobs" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          {reportTab === 2 && (
            <Box>
              <Typography variant="h6" className="ccl-section-title">
                Top Jobs by Applications
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleExportCSV(applicationStats, 'application_stats.csv')}
                className="ccl-export-button"
                sx={{ mb: 2 }}
              >
                Export CSV
              </Button>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="job_title" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="application_count" fill="#8884d8" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHome;