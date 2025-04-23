import React from 'react';
import '../../../Components/Subscription/Subcription.css';




function MobileMenuToggle({ toggleSidebar, isSidebarVisible }) {
  return (
    <button 
      className={`mobile-menu-toggle ${isSidebarVisible ? 'active' : ''}`} 
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
      </svg>
    </button>
  );
}

export default MobileMenuToggle;