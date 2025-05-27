import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MdOutlineAddTask } from "react-icons/md";
import { HiHome } from "react-icons/hi2";
import { PiUserCircleCheckFill, PiCalendarCheck, PiClipboardTextFill } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { RiVipCrownLine } from "react-icons/ri";
import { set_Authentication } from "../../Redux/Authentication/authenticationSlice";
import axios from "axios";
import Swal from "sweetalert2";
import "../../Styles/SideBar.css";

function SideBar({ hideHeader = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authentication_user);
  const [isOpen, setIsOpen] = useState(false);
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access");
  const baseURL = "http://127.0.0.1:8000/";

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const fetchUsageData = async () => {
    setUsageLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}api/empjob/job-usage/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setUsageData(response.data);
      }
    } catch (error) {
      console.error("Error fetching job usage data:", error.response?.data || error);
      if (error.response?.status === 404) {
        console.warn("Job usage endpoint not found. Using fallback data.");
        setUsageData({ job_count: 0, has_active_subscription: false });
      } else {
        setError("Failed to load usage data.");
      }
    } finally {
      setUsageLoading(false);
    }
  };

  const initiatePaymentForExtraJob = async () => {
    try {
      const response = await axios.post(
        `${baseURL}api/payment/create/`,
        { employer_id: authentication_user.user_type_id },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const { id: order_id, amount, key } = response.data;

      const options = {
        key,
        amount,
        currency: "INR",
        order_id,
        name: "Additional Job Posting",
        description: "Payment for posting an additional job",
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${baseURL}api/payment/verify/`,
              {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                transaction_id: response.razorpay_payment_id,
                method: "Razorpay",
              },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            if (verifyResponse.data.success) {
              Swal.fire({
                icon: "success",
                title: "Payment Successful",
                text: "You can now post an additional job!",
              });
              navigate("/employer/postjob/");
            }
          } catch (verifyErr) {
            Swal.fire({
              icon: "error",
              title: "Payment Verification Failed",
              text: "Please try again or contact support.",
            });
          }
        },
        prefill: { email: authentication_user.email || "", contact: authentication_user.phone || "" },
        theme: { color: "#4B5563" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: response.error.description,
        });
      });
      rzp.open();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Payment Initiation Failed",
        text: "Unable to process payment. Please try again.",
      });
    }
  };

  const handlePostJobClick = (e) => {
    if (!usageData?.has_active_subscription) {
      e.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "No Active Subscription",
        text: "Please subscribe to a plan to post jobs.",
        showCancelButton: true,
        confirmButtonText: "View Plans",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/employer/subscriptions");
        }
      });
    } else if (usageData.remaining_jobs !== "Unlimited" && usageData.remaining_jobs <= 0) {
      e.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "Job Limit Reached",
        text: "You have reached your job posting limit. Upgrade your plan or pay for an additional job posting.",
        showCancelButton: true,
        confirmButtonText: "Upgrade Plan",
        cancelButtonText: "Pay for Extra Job",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/employer/subscriptions");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          initiatePaymentForExtraJob();
        }
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsageData();
    }
  }, [token]);

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

  return (
    <div className={`employer-sidebar ${isOpen ? "open" : ""}`}>
      <div className="employer-sidebar-logo">
        <h1>Dashboard</h1>
      </div>

      <Link
        to="/employer/postjob/"
        onClick={handlePostJobClick}
        className="employer-post-job-button-sidebar"
      >
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
        <li>
          <Link
            to="/employer/shedules"
            className={`employer-sidebar-link ${
              location.pathname === "/employer/shedules" ? "active" : ""
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
  );
}

export default SideBar;