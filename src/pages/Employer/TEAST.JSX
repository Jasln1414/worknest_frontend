function CandidateHome() {
    const baseURL = 'http://127.0.0.1:8000';
    const [jobData, setJobData] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    // Add image cache state
    const [imageCache, setImageCache] = useState({});
  
    const [searchParams, setSearchParams] = useState({
      keyword: '',
      location: '',
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
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
  
    // Function to cache and pre-load images
    const getImageForCache = useCallback((imageUrl) => {
      if (!imageUrl) return null;
      
      // Format the URL properly
      let formattedUrl = imageUrl;
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        formattedUrl = `${baseURL}/${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        formattedUrl = `${baseURL}${imageUrl}`;
      }
      
      // Check if it's already in the cache
      if (imageCache[formattedUrl]) {
        return formattedUrl;
      }
      
      // Pre-load the image
      const img = new Image();
      img.src = formattedUrl;
      
      // When loaded, add to cache
      img.onload = () => {
        setImageCache(prev => ({
          ...prev,
          [formattedUrl]: formattedUrl
        }));
      };
      
      return formattedUrl;
    }, [baseURL, imageCache]);
  
    // Custom debounce
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
          
          // Pre-cache profile images
          activeJobs.forEach(job => {
            if (job.employer?.profile_pic) {
              getImageForCache(job.employer.profile_pic);
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
          
          // Pre-cache profile images
          activeJobs.forEach(job => {
            if (job.employer?.profile_pic) {
              getImageForCache(job.employer.profile_pic);
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
  
        // Add search parameters
        if (updatedSearchParams.keyword) {
          const keywords = updatedSearchParams.keyword
            .toLowerCase()
            .trim()
            .split(/\s+/);
          if (keywords.length > 0 && keywords[0]) {
            queryParams.append('search', keywords.join(','));
          }
        }
        if (updatedSearchParams.location) {
          queryParams.append('location', updatedSearchParams.location);
        }
  
        // Add filter parameters
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
          queryParams.append('date_posted', updatedFilters.datePosted);
        }
        if (updatedFilters.salary && updatedFilters.salary > 0) {
          const salaryValue = updatedFilters.salaryType === 'hourly'
            ? updatedFilters.salary * 40 * 52 / 1000 // Convert to K for API
            : updatedFilters.salary;
          queryParams.append('salary', salaryValue);
          queryParams.append('salary_type', updatedFilters.salaryType);
        }
        queryParams.append('active', 'true');
  
        const queryString = queryParams.toString();
        console.log('Search query:', `${baseURL}/api/empjob/search/?${queryString}`);
  
        const cached = getCachedResults(queryString);
        if (cached && cached.length > 0) {
          console.log('Using cached search results:', cached);
          
          // Pre-cache profile images
          cached.forEach(job => {
            if (job.employer?.profile_pic) {
              getImageForCache(job.employer.profile_pic);
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
            
            // Pre-cache profile images
            activeJobs.forEach(job => {
              if (job.employer?.profile_pic) {
                getImageForCache(job.employer.profile_pic);
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
      const { name, value } = e.target;
      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Uncomment to enable auto-search on typing
      // debouncedHandleSearch();
    };
  
    const resetFilters = () => {
      setSearchParams({ keyword: '', location: '' });
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
          <h1>Find Your Next Opportunity</h1>
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
                  img={job.employer?.profile_pic}
                  title={job.title}
                  posted={job.posteDate}
                  applybefore={job.applyBefore}
                  empname={job.employer?.user?.full_name || 'Unknown Company'}
                  experience={job.experience}
                  jobmode={job.jobmode}
                  jobtype={job.jobtype}
                  location={job.location}
                  salary={job.lpa}
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