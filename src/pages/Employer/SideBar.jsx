import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MdOutlineAddTask } from "react-icons/md";
import { HiHome } from "react-icons/hi2";
import { PiUserCircleCheckFill, PiCalendarCheck } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { PiClipboardTextFill } from "react-icons/pi";
import { RiVipCrownLine } from "react-icons/ri";
import { set_Authentication } from "../../Redux/Authentication/authenticationSlice";
import "../../Styles/SideBar.css";

function SideBar({ hideHeader = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authentication_user);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(
      set_Authentication({
        name: null,
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        usertype: null,
      })
    );
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
     
      
      <div className={`employer-sidebar ${isOpen ? "open" : ""}`}>
        <div className="employer-sidebar-logo">
          <h1>Dashboard</h1>
        </div>
        
        <Link to="/employer/postjob/" className="employer-post-job-button-sidebar">
          <MdOutlineAddTask className="icon" />
          <span>Post Job</span>
        </Link>
      
        <ul className="employer-sidebar-list">
          <li>
            <Link
              to="/employer/EmpHome"
              className={`employer-sidebar-link ${
                location.pathname === "/employer/EmpHome" ? "active" : ""
              }`}
            >
              <HiHome className="icon" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/employer/profile/"
              className={`employer-sidebar-link ${
                location.pathname === "/employer/profile/" ? "active" : ""
              }`}
            >
              <PiUserCircleCheckFill className="icon" />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link
              to="/employer/applications"
              className={`employer-sidebar-link ${
                location.pathname === "/employer/applications" ? "active" : ""
              }`}
            >
              <PiClipboardTextFill className="icon" />
              <span>Applications</span>
            </Link>
          </li>
          <li>
            <Link
              to="/employer/subscriptions"
              className={`employer-sidebar-link ${
                location.pathname === "/employer/subscriptions" ? "active" : ""
              }`}
            >
              <RiVipCrownLine className="icon" />
              <span>Subscription Plans</span>
            </Link>
          </li>
        {/* New Schedules Link */}
          <li>
            <Link
              to="/employer/shedules"
              className={`employer-sidebar-link ${
                location.pathname === "/shedules" ? "active" : ""
              }`}
            >
              <PiCalendarCheck className="icon" />
              <span>Schedules</span>
            </Link>
          </li>
        </ul>
        
        <button onClick={handleLogout} className="signout">
          <IoIosLogOut className="icon-1" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}

export default SideBar;