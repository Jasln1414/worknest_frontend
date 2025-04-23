import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiFilter, FiChevronDown, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
// import '../../../Styles/Job/AppliedJob.css';

// Helper function to parse salary strings to annual USD
const parseSalaryToUSD = (salaryStr) => {
  if (!salaryStr) return 0;
  const str = salaryStr.toLowerCase().trim();

  if (str.includes('/hr') || str.includes('/hour')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return num * 40 * 52; // Convert hourly to annual USD (40 hrs/week, 52 weeks)
  } else if (str.includes('k')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return num * 1000; // Convert $K to annual USD
  }
  return parseFloat(str); // Fallback to numeric value (assumed annual USD)
};

const applyAdvancedFilters = (currentFilters = {}, jobData = []) => {
  let filteredResults = [...jobData];

  // Date Posted filtering
  if (currentFilters.datePosted) {
    const now = new Date();
    let startDate;
    switch (currentFilters.datePosted) {
      case '24h': startDate = new Date(now.setDate(now.getDate() - 1)); break;
      case '7d': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case '30d': startDate = new Date(now.setDate(now.getDate() - 30)); break;
      default: startDate = null;
    }
    if (startDate) {
      filteredResults = filteredResults.filter(job =>
        !job.posteDate || new Date(job.posteDate) >= startDate
      );
    }
  }

  // Job Type filtering
  if (currentFilters.jobtype) {
    filteredResults = filteredResults.filter(job =>
      job.jobtype === currentFilters.jobtype
    );
  }

  // Experience filtering
  if (currentFilters.experience) {
    filteredResults = filteredResults.filter(job =>
      job.experience === currentFilters.experience
    );
  }

  // Job Mode filtering
  if (currentFilters.jobmode) {
    const filterValue = currentFilters.jobmode.toLowerCase().replace(/[\s-]+/g, '');
    filteredResults = filteredResults.filter(job => {
      if (!job.jobmode) return true;
      const jobMode = job.jobmode.toLowerCase().replace(/[\s-]+/g, '');
      switch (filterValue) {
        case 'remote':
          return jobMode.includes('remote') || jobMode.includes('workfromhome');
        case 'onsite':
          return jobMode.includes('onsite') || jobMode.includes('office') || jobMode === 'onsite';
        case 'hybrid':
          return jobMode.includes('hybrid');
        default:
          return jobMode === filterValue;
      }
    });
  }

  // Location filtering
  if (currentFilters.location) {
    filteredResults = filteredResults.filter(job =>
      job.location?.toLowerCase().includes(currentFilters.location.toLowerCase())
    );
  }

  // Salary filtering
  if (currentFilters.salary && currentFilters.salary > 0) {
    const isHourly = currentFilters.salaryType === 'hourly';
    const minSalary = Number(currentFilters.salary); // Raw value from slider
    const minSalaryUSD = isHourly ? minSalary * 40 * 52 : minSalary * 1000; // Convert to annual USD

    filteredResults = filteredResults.filter(job => {
      if (!job.lpa) return true;

      const lpaStr = job.lpa.toLowerCase().trim();
      let jobSalaryUSD = 0;

      if (lpaStr.includes('-')) {
        const [minStr] = lpaStr.split('-');
        jobSalaryUSD = parseSalaryToUSD(minStr);
      } else {
        jobSalaryUSD = parseSalaryToUSD(lpaStr);
      }

      console.log(`Job "${job.title || 'Unknown'}": USD: ${jobSalaryUSD}, Raw LPA: ${job.lpa}, Filter USD: ${minSalaryUSD}, Pass: ${jobSalaryUSD >= minSalaryUSD}`);
      return jobSalaryUSD >= minSalaryUSD;
    });
  }

  console.log('Filtered results count:', filteredResults.length);
  return filteredResults;
};

const QuickFilterDropdowns = ({
  filters,
  setFilters,
  handleSearch,
  jobData = [],
  setFilteredJobs,
  isSearching = false,
  onResetAllFilters
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [salaryValue, setSalaryValue] = useState(filters.salary || 0);
  const [tempSalaryValue, setTempSalaryValue] = useState(salaryValue);
  const [salaryType, setSalaryType] = useState(filters.salaryType || 'annual'); // 'annual' or 'hourly'
  const [isDragging, setIsDragging] = useState(false);
  const dropdownContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedApplyFilters = useCallback(
    debounce((newFilters) => {
      console.log("Debounced apply filters with:", newFilters);
      if (setFilteredJobs && jobData.length > 0) {
        const filteredResults = applyAdvancedFilters(newFilters, jobData);
        console.log("Setting filtered jobs:", filteredResults.length);
        setFilteredJobs(filteredResults);
      } else {
        console.log("Falling back to handleSearch");
        handleSearch(newFilters);
      }
    }, 300),
    [jobData, setFilteredJobs, handleSearch]
  );

  const filterOptions = [
    { key: "jobmode", label: "Job Mode", tooltip: "Filter by work arrangements", options: [
      { label: "Any Mode", value: "" }, { label: "Remote", value: "Remote" },
      { label: "On Site", value: "On Site" }, { label: "Hybrid", value: "Hybrid" }
    ]},
    { key: "jobtype", label: "Job Type", tooltip: "Filter by employment type", options: [
      { label: "Any Type", value: "" }, { label: "Full Time", value: "Full Time" },
      { label: "Part Time", value: "Part Time" }
    ]},
    { key: "experience", label: "Experience", tooltip: "Filter by experience level", options: [
      { label: "Any Experience", value: "" }, { label: "Internship", value: "Internship" },
      { label: "Entry Level", value: "Entry Level" }, { label: "Associate", value: "Associate" },
      { label: "Mid Level", value: "Mid Level" }, { label: "Senior Level", value: "Senior Level" }
    ]},
    { key: "datePosted", label: "Date Posted", tooltip: "Filter by posting date", options: [
      { label: "Any Time", value: "" }, { label: "Last 24 Hours", value: "24h" },
      { label: "Last 7 Days", value: "7d" }, { label: "Last 30 Days", value: "30d" }
    ]},
    { key: "location", label: "Location", tooltip: "Filter by job location", options: [
      { label: "Any Location", value: "" }, { label: "Miami", value: "Miami" },
      { label: "Tampa", value: "Tampa" }, { label: "Nashville", value: "Nashville" },
      { label: "Florida", value: "Florida" }, { label: "Remote", value: "Remote" }
    ]},
    { key: "salary", label: "Salary", tooltip: "Filter by salary", isSalary: true },
  ];

  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== "" && value !== undefined && value !== 0).length;
    setActiveFilterCount(count);
  }, [filters]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (filters.salary !== undefined) {
      setSalaryValue(filters.salary);
      setTempSalaryValue(filters.salary);
    }
    if (filters.salaryType) {
      setSalaryType(filters.salaryType);
    }
  }, [filters.salary, filters.salaryType]);

  const handleDropdownChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (!isMobile) setOpenDropdown(null);
    if (setFilteredJobs && jobData.length > 0) {
      const filteredResults = applyAdvancedFilters(newFilters, jobData);
      setFilteredJobs(filteredResults);
    } else {
      setTimeout(() => handleSearch(newFilters), 100);
    }
  };

  const handleSalaryChange = (event) => {
    const value = Number(event.target.value);
    setTempSalaryValue(value);
    if (!isDragging) setIsDragging(true);
  };

  const handleSalaryChangeEnd = () => {
    setIsDragging(false);
    setSalaryValue(tempSalaryValue);
    const newFilters = { ...filters, salary: tempSalaryValue, salaryType };
    console.log("Salary change end, new filters:", newFilters);
    setFilters(newFilters);
    debouncedApplyFilters(newFilters);
  };

  const handleSalaryTypeChange = (type) => {
    setSalaryType(type);
    setSalaryValue(0);
    setTempSalaryValue(0);
    const newFilters = { ...filters, salary: 0, salaryType: type };
    setFilters(newFilters);
    debouncedApplyFilters(newFilters);
  };

  const handleResetFilter = (key, event) => {
    event.stopPropagation();
    const defaultValue = key === 'salary' ? 0 : "";
    const newFilters = { ...filters, [key]: defaultValue };
    if (key === 'salary') {
      setSalaryValue(0);
      setTempSalaryValue(0);
    }
    setFilters(newFilters);
    if (setFilteredJobs && jobData.length > 0) {
      const filteredResults = applyAdvancedFilters(newFilters, jobData);
      setFilteredJobs(filteredResults);
    } else {
      setTimeout(() => handleSearch(newFilters), 100);
    }
  };

  const toggleDropdown = (key) => setOpenDropdown(openDropdown === key ? null : key);

  const getButtonLabel = (filter) => {
    if (filter.isSalary) {
      return isFilterActive('salary') ? `Salary: ${formatSalary(salaryValue)}` : filter.label;
    }
    if (!filters[filter.key]) return filter.label;
    const option = filter.options.find((opt) => opt.value === filters[filter.key]);
    return option ? option.label : filter.label;
  };

  const isFilterActive = (key) => key === 'salary' ? filters[key] > 0 : filters[key] !== "" && filters[key] !== undefined;

  const handleCloseDropdown = (e) => {
    e.stopPropagation();
    setOpenDropdown(null);
  };

  const formatSalary = (value) => salaryType === 'hourly' ? `$${Number(value).toFixed(1)}/Hour` : `$${Number(value).toLocaleString('en-US')}K`;

  return (
   <div>
    <div style={{ padding: '12px 0', width: '100%' }}>
      <div
        ref={dropdownContainerRef}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '8px' : '12px',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          width: '100%',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
        }}
      >
        {filterOptions.map((filter) => (
          <div
            key={filter.key}
            style={{
              position: 'relative',
              flex: isMobile ? '1 0 100%' : '0 0 160px',
              minWidth: isMobile ? '100%' : '160px',
              maxWidth: isMobile ? '100%' : '180px',
            }}
          >
            <button
              onClick={() => toggleDropdown(filter.key)}
              disabled={isSearching}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 12px',
                // background: isFilterActive(filter.key)
                // ? 'linear-gradient(to right, #e6f0fd, #d1e2fc)'
                // : 'linear-gradient(to right, #ffffff, #f5f5f5)',
                background: isFilterActive(filter.key)
  ? 'linear-gradient(to right, #fffff, #fffff)'
  : 'linear-gradient(to right, #fffff, # #f5f5f5)',
                color: isFilterActive(filter.key) ? '#00000' : '#464646',
                borderRadius: '90px', // Increased for smoother corners
                border: '1px  solid #43618b ',
                fontSize: '19px',
                fontWeight: '500',
                cursor: isSearching ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease, color 0.3s ease, transform 0.2s ease',
                opacity: isSearching ? 0.6 : 1,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                height: '50px',
                transform: isFilterActive(filter.key) ? 'scale(1.02)' : 'scale(1)',
              }}
              title={filter.tooltip}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getButtonLabel(filter)}
              </span>
              {isFilterActive(filter.key) ? (
                <span
                  onClick={(e) => handleResetFilter(filter.key, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: '70%', // Circular for reset button
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#00000',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  title="Clear filter"
                >
                  <FiX size={16} />
                </span>
              ) : (
                <FiChevronDown
                  size={16}
                  style={{
                    flexShrink: 0,
                    marginLeft: '8px',
                    transition: 'transform 0.2s ease',
                    transform: openDropdown === filter.key ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              )}
            </button>
            {openDropdown === filter.key && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#ffffff',
                  borderRadius: '10px', // Increased for dropdown menu
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  width: isMobile ? '100%' : '200px',
                  zIndex: 1000,
                  marginTop: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {filter.isSalary ? (
                  <div style={{ padding: '16px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button
                        onClick={() => handleSalaryTypeChange('annual')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px', // Slightly smaller for toggle buttons
                          border: 'none',
                          background: salaryType === 'annual' ? '#1e3a8a' : '#e5e7eb',
                          color: salaryType === 'annual' ? '#ffffff' : '#1f2937',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease, color 0.2s ease',
                        }}
                      >
                        Annual ($K)
                      </button>
                      <button
                        onClick={() => handleSalaryTypeChange('hourly')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px', // Slightly smaller for toggle buttons
                          border: 'none',
                          background: salaryType === 'hourly' ? '#1e3a8a' : '#e5e7eb',
                          color: salaryType === 'hourly' ? '#ffffff' : '#1f2937',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease, color 0.2s ease',
                        }}
                      >
                        Hourly ($/Hour)
                      </button>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e3a8a',
                        marginBottom: '12px',
                        transition: 'opacity 0.2s ease',
                        opacity: isDragging ? 0.7 : 1,
                        borderRadius: '6px', // Subtle rounding for display
                        padding: '4px',
                      }}
                    >
                      {formatSalary(tempSalaryValue)}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={salaryType === 'hourly' ? 100 : 150}
                      step={salaryType === 'hourly' ? 0.5 : 1}
                      value={tempSalaryValue}
                      onChange={handleSalaryChange}
                      onMouseUp={handleSalaryChangeEnd}
                      onTouchEnd={handleSalaryChangeEnd}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px', // Consistent with slider
                        background: '#e5e7eb',
                        outline: 'none',
                        cursor: 'pointer',
                        accentColor: '#1e3a8a',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '8px',
                        borderRadius: '6px', // Subtle rounding for labels
                        padding: '4px',
                      }}
                    >
                      <span>{formatSalary(0)}</span>
                      <span>{formatSalary(salaryType === 'hourly' ? 100 : 150)}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        borderRadius: '10px 10px 0 0', // Rounded top for header
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a8a' }}>
                        {filter.label}
                      </span>
                      <button
                        onClick={handleCloseDropdown}
                        style={{
                          padding: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          transition: 'color 0.2s ease',
                          borderRadius: '50%', // Circular for close button
                        }}
                        aria-label="Close dropdown"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                    <div style={{ padding: '8px 0', borderRadius: '0 0 10px 10px' }}>
                      {filter.options.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleDropdownChange(filter.key, option.value)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 16px',
                            cursor: 'pointer',
                            background: filters[filter.key] === option.value ? '#e0f2fe' : 'transparent',
                            color: filters[filter.key] === option.value ? '#1e3a8a' : '#1f2937',
                            transition: 'background 0.2s ease, color 0.2s ease',
                            borderRadius: '6px', // Rounded options
                            margin: '0 8px', // Slight margin for separation
                          }}
                        >
                          <span style={{ flex: 1, fontSize: '14px' }}>{option.label}</span>
                          {filters[filter.key] === option.value && (
                            <FiCheck size={16} style={{ color: '#1e3a8a' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default QuickFilterDropdowns;