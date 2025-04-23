
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import JobCard from './utilities/Jobcard';
import Pagination from './utilities/Paginations';
import BlinkingArrow from './utilities/BlinkingArow';
import SearchBox from './utilities/SearchBox';
import QuickFilterDropdowns from './utilities/Filter';
//import '../../assets/COMPONENTS/Findjob.css';
import '../../assets/component/Findjob.css';



function CandidateHome() {
  const baseURL = 'http://127.0.0.1:8000';
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imageCache, setImageCache] = useState({});

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    location: '',
    suggestionType: '', // Track suggestion type
  });

  const [filters, setFilters] = useState({
    jobtype: '',
    jobmode: '',
    experience: '',
    lpa: '',
    location: '',
    datePosted: '',
    salary: 0,
    salaryType: 'annual',
  });

  const itemsPerPage = 6;
  const token = localStorage.getItem('access');
  const cacheKey = 'jobSearchCache';
  const cacheTTL = 5 * 60 * 1000;

  const getImageForCache = useCallback(
    (imageUrl) => {
      if (!imageUrl) return null;
  
      // Return full URL if already complete
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
  
      // Build full URL from relative path
      const formattedUrl = imageUrl.startsWith('/')
        ? `${baseURL}${imageUrl}`
        : `${baseURL}/${imageUrl}`;
  
      // Return if already cached
      if (imageCache[formattedUrl]) {
        return formattedUrl;
      }
  
      // Preload the image to confirm it's valid
      const img = new Image();
      img.src = formattedUrl;
  
      img.onload = () => {
        setImageCache((prev) => ({
          ...prev,
          [formattedUrl]: true,
        }));
      };
  
      img.onerror = () => {
        console.warn('Failed to load image:', formattedUrl);
      };
  
      return formattedUrl;
    },
    [baseURL, imageCache, setImageCache]
  );
  

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const getCachedResults = (query) => {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    if (cached.query === query && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
    }
    return null;
  };

  const setCacheResults = (query, data) => {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ query, data, timestamp: Date.now() })
    );
  };

  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    setSearchPerformed(false);
    setError(null);
    try {
      if (!token) {
        setError('Please log in to view jobs.');
        setFilteredJobs([]);
        return;
      }

      const cached = getCachedResults('all_jobs');
      if (cached) {
        console.log('Using cached all_jobs:', cached);
        const activeJobs = cached.filter((job) => job.active);

        // Process each job's profile picture
        activeJobs.forEach((job) => {
          if (job.employer?.profile_pic) {
            job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
          }
        });

        setJobData(activeJobs);
        setFilteredJobs(activeJobs);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${baseURL}/api/empjob/getAlljobs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('fetchAllJobs response:', response.data);
      if (response.status === 200) {
        const jobs = Array.isArray(response.data) ? response.data : [];
        const activeJobs = jobs.filter((job) => job.active);

        // Process each job's profile picture
        activeJobs.forEach((job) => {
          if (job.employer?.profile_pic) {
            job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
          }
        });

        setJobData(activeJobs);
        setFilteredJobs(activeJobs);
        setCacheResults('all_jobs', activeJobs);
        setError(null);
      } else {
        setError('Failed to fetch job data.');
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('fetchAllJobs error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access');
      } else {
        setError('An error occurred while fetching jobs.');
      }
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, [token, getImageForCache]);

  // Improved handleSearch function with better profile picture handling
  const handleSearch = useCallback(
    async (updatedFilters = filters, updatedSearchParams = searchParams) => {
      if (isSearching) {
        console.log('Search skipped: already searching');
        return;
      }

      console.log('Search params:', updatedSearchParams);
      console.log('Filter params:', updatedFilters);

      setIsSearching(true);
      setLoading(true);
      setSearchPerformed(true);
      setCurrentPage(1);

      const queryParams = new URLSearchParams();

      // Handle suggestion type for precise filtering
      if (updatedSearchParams.keyword && updatedSearchParams.suggestionType) {
        const type = updatedSearchParams.suggestionType;
        if (type === 'title') {
          queryParams.append('search', updatedSearchParams.keyword); // Use 'search' for titles
        } else if (type === 'jobtype') {
          queryParams.append('jobtype', updatedSearchParams.keyword);
        } else if (type === 'jobmode') {
          queryParams.append('jobmode', updatedSearchParams.keyword);
        } else if (type === 'industry') {
          queryParams.append('industry', updatedSearchParams.keyword);
        } else {
          const keywords = updatedSearchParams.keyword
            .toLowerCase()
            .trim()
            .split(/\s+/);
          if (keywords.length > 0 && keywords[0]) {
            queryParams.append('search', keywords.join(' '));
          }
        }
      } else if (updatedSearchParams.keyword) {
        const keywords = updatedSearchParams.keyword
          .toLowerCase()
          .trim()
          .split(/\s+/);
        if (keywords.length > 0 && keywords[0]) {
          queryParams.append('search', keywords.join(' '));
        }
      }

      if (updatedSearchParams.location) {
        queryParams.append('location', updatedSearchParams.location);
      }

      if (updatedFilters.jobtype) {
        queryParams.append('jobtype', updatedFilters.jobtype);
      }
      if (updatedFilters.jobmode) {
        queryParams.append('jobmode', updatedFilters.jobmode);
      }
      if (updatedFilters.experience) {
        queryParams.append('experience', updatedFilters.experience);
      }
      if (updatedFilters.lpa) {
        queryParams.append('lpa', updatedFilters.lpa);
      }
      if (updatedFilters.location && !updatedSearchParams.location) {
        queryParams.append('location', updatedFilters.location);
      }
      if (updatedFilters.datePosted) {
        queryParams.append('recent', updatedFilters.datePosted);
      }
      if (updatedFilters.salary && updatedFilters.salary > 0) {
        queryParams.append('lpa', updatedFilters.salary);
      }
      queryParams.append('active', 'true');

      const queryString = queryParams.toString();
      console.log('Search query:', `${baseURL}/api/empjob/search/?${queryString}`);

      const cached = getCachedResults(queryString);
      if (cached && cached.length > 0) {
        console.log('Using cached search results:', cached);
        
        // Process each job's profile picture from cache
        cached.forEach((job) => {
          if (job.employer?.profile_pic) {
            job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
          }
        });
        
        setFilteredJobs(cached);
        setError(null);
        setLoading(false);
        setIsSearching(false);
        return;
      }

      try {
        if (!token) {
          setError('Please log in to search jobs.');
          setFilteredJobs([]);
          return;
        }

        const response = await axios.get(
          `${baseURL}/api/empjob/search/?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Search response:', response.data);
        if (response.status === 200) {
          const jobs = Array.isArray(response.data)
            ? response.data
            : response.data.results && Array.isArray(response.data.results)
            ? response.data.results
            : [];
          const activeJobs = jobs.filter((job) => job.active);
          
          // Process each job's profile picture
          activeJobs.forEach((job) => {
            if (job.employer?.profile_pic) {
              // Add a formatted profile pic property
              job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
              console.log('Processed image:', job.employer.profile_pic, 'to', job.employer.formattedProfilePic);
            } else {
              console.log('No profile pic for:', job.title);
            }
          });
          
          setFilteredJobs(activeJobs);
          setCacheResults(queryString, activeJobs);
          setError(null);
        } else {
          setError('No jobs found matching your criteria.');
          setFilteredJobs([]);
        }
      } catch (error) {
        console.error('Search error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('access');
        } else {
          setError('Error during search. Please try again.');
        }
        setFilteredJobs([]);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [filters, searchParams, token, isSearching, getImageForCache]
  );
  
  const debouncedHandleSearch = debounce(() => handleSearch(filters, searchParams), 300);

  const handleSearchInputChange = (e) => {
    const { name, value, suggestionType } = e.target || e;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
      suggestionType: suggestionType || '', // Store suggestion type
    }));
  };

  const resetFilters = () => {
    setSearchParams({ keyword: '', location: '', suggestionType: '' });
    setFilters({
      jobtype: '',
      jobmode: '',
      experience: '',
      lpa: '',
      location: '',
      datePosted: '',
      salary: 0,
      salaryType: 'annual',
    });
    fetchAllJobs();
  };

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  const getCurrentJobs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="find-job-page-h1233">
        <div className="loading-container-h1233">
          <div className="spinner-h1233"></div>
          <p>Loading job listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="find-job-page-h1233">
      <div className="find-job-header-h1233">
        <h1 style={{ color:'#3e71b5'}}>Find Your Next Opportunity</h1>
        <p>Browse through hundreds of job listings tailored for you</p>
      </div>

      <SearchBox
        searchParams={searchParams}
        handleSearchInputChange={handleSearchInputChange}
        handleSearch={() => handleSearch(filters, searchParams)}
        isSearching={isSearching}
      />

      <QuickFilterDropdowns
        filters={filters}
        setFilters={setFilters}
        handleSearch={handleSearch}
        jobData={jobData}
        setFilteredJobs={setFilteredJobs}
        isSearching={isSearching}
        onResetAllFilters={resetFilters}
      />

      {error && (
        <div className="error-container-h1233">
          <p className="error-text-h1233">{error}</p>
          <button onClick={resetFilters} className="reset-filters-button">
            Reset Filters
          </button>
        </div>
      )}

      <div className="jobs-content-area">
        <div className="search-status">
          <p className="activejobs">
            {filteredJobs.length} active job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
          {searchPerformed && filteredJobs.length === 0 && (
            <button onClick={fetchAllJobs} className="view-all-jobs-button">
              View All Available Jobs
            </button>
          )}
        </div>

        <div className="job-cards-container-h1233">
          {getCurrentJobs().length > 0 ? (
            getCurrentJobs().map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                baseURL={baseURL}
                img={job.employer?.formattedProfilePic} // Using ONLY formattedProfilePic
                title={job.title}
                posted={job.posteDate}
                applybefore={job.applyBefore}
                empname={job.employer?.user?.full_name || 'Unknown Company'}
                experience={job.experience}
                jobmode={job.jobmode}
                jobtype={job.jobtype}
                location={job.location}
                salary={job.lpa}
                getImageForCache={getImageForCache} // Pass the function as prop
              />
            ))
          ) : (
            <div className="no-jobs-message-h1233">
              <p>No active jobs match your current filters</p>
              <BlinkingArrow onClick={fetchAllJobs} />
              <p>Click to see all available active jobs</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

export default CandidateHome; 