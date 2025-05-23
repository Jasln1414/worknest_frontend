import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Home, People, Business, Work, BarChart, ExitToApp } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { set_Authentication } from '../../../Redux/Authentication/authenticationSlice';
import '../../../Styles/Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    dispatch(
      set_Authentication({
        name: null,
        isAuthenticated: false,
        isAdmin: false,
      })
    );
    navigate('/admin/');
  };

  return (
    <div className="ccl-sidebar">
      <List>
        <ListItem button component={Link} to="/admin/home">
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/admin/clist">
          <ListItemIcon><People /></ListItemIcon>
          <ListItemText primary="Candidates" />
        </ListItem>
        <ListItem button component={Link} to="/admin/elist">
          <ListItemIcon><Business /></ListItemIcon>
          <ListItemText primary="Employers" />
        </ListItem>
        <ListItem button component={Link} to="/admin/jobList">
          <ListItemIcon><Work /></ListItemIcon>
          <ListItemText primary="Jobs" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/admin/Subplan">
          <ListItemIcon><Work /></ListItemIcon>
          <ListItemText primary="Subscription Plans" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/admin/reports">
          <ListItemIcon><BarChart /></ListItemIcon>
          <ListItemText primary="Sales Report" />
        </ListItem>
        <Divider />
        <ListItem button onClick={handleSignOut}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </div>
  );
}

export default Sidebar;