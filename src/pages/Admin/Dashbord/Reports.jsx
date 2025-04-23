import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Papa from 'papaparse';
import { getUserGrowthReport, getJobTrendReport, getApplicationStatsReport } from '../api';

const Reports = () => {
  const [reportTab, setReportTab] = useState(0);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [jobTrendData, setJobTrendData] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    fetchReports();
  }, [daysFilter]);

  const fetchReports = () => {
    getUserGrowthReport({ days: daysFilter })
      .then((res) => setUserGrowthData(res.data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString()
      }))))
      .catch((err) => console.error('Error fetching user growth:', err));

    getJobTrendReport({ days: daysFilter })
      .then((res) => setJobTrendData(res.data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString()
      }))))
      .catch((err) => console.error('Error fetching job trends:', err));

    getApplicationStatsReport()
      .then((res) => setApplicationStats(res.data))
      .catch((err) => console.error('Error fetching application stats:', err));
  };

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
    <Box>
      <Typography variant="h4" gutterBottom>Reports</Typography>
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
          <Typography variant="h6">User Growth Over Time</Typography>
          <Button
            variant="contained"
            onClick={() => handleExportCSV(userGrowthData, 'user_growth.csv')}
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
          <Typography variant="h6">Job Posting Trends</Typography>
          <Button
            variant="contained"
            onClick={() => handleExportCSV(jobTrendData, 'job_trends.csv')}
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
          <Typography variant="h6">Top Jobs by Applications</Typography>
          <Button
            variant="contained"
            onClick={() => handleExportCSV(applicationStats, 'application_stats.csv')}
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
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Applications</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicationStats.map((stat) => (
                <TableRow key={stat.job_id}>
                  <TableCell>{stat.job_id}</TableCell>
                  <TableCell>{stat.job_title}</TableCell>
                  <TableCell>{stat.application_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Reports;