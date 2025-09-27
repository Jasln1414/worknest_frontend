// // // import React, { createContext, useContext, useEffect, useState } from 'react';
// // // import axios from 'axios';

// // // export const NotificationContext = createContext();

// // // export const NotificationProvider = ({ children, userId, userType }) => {
// // //   const [notifications, setNotifications] = useState([]);
// // //   const [unreadCount, setUnreadCount] = useState(0);

// // //   useEffect(() => {
// // //     if (!userId) {
// // //       console.error(`NotificationProvider (${userType}): No userId provided!`);
// // //       return;
// // //     }

// // //     // Correct URL with "notifications" (plural)
// // //     const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
// // //     console.log(`[${userType}] Connecting to ${wsUrl}`);
// // //     const socket = new WebSocket(wsUrl);

// // //     socket.onopen = () => {
// // //       console.log(`[${userType}] WebSocket opened for user ${userId}`);
// // //     };

// // //     socket.onmessage = (event) => {
// // //       const data = JSON.parse(event.data);
// // //       console.log(`[${userType}] Received for user ${userId}:`, data);
// // //       if (data.type === 'notify_message') {
// // //         setNotifications((prev) => [...prev, data.message]);
// // //         setUnreadCount(data.unread_count);
// // //       }
// // //     };

// // //     socket.onerror = (error) => {
// // //       console.error(`[${userType}] WebSocket error for user ${userId}:`, error);
// // //     };

// // //     socket.onclose = (event) => {
// // //       console.log(`[${userType}] WebSocket closed for user ${userId}:`, event.code, event.reason);
// // //     };

// // //     return () => {
// // //       console.log(`[${userType}] Closing WebSocket for user ${userId}`);
// // //       socket.close();
// // //     };
// // //   }, [userId, userType]);

// // //   const markAllAsRead = async () => {
// // //     try {
// // //       const token = localStorage.getItem('access');
// // //       await axios.post(
// // //         'http://127.0.0.1:8000/api/chat/mark-all-read/',
// // //         { user_id: userId },
// // //         { headers: { Authorization: `Bearer ${token}` } }
// // //       );
// // //       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
// // //       setUnreadCount(0);
// // //       console.log(`[${userType}] Marked all as read for user ${userId}`);
// // //     } catch (error) {
// // //       console.error(`[${userType}] Error marking all as read:`, error);
// // //     }
// // //   };

// // //   const clearNotification = (timestamp) => {
// // //     setNotifications((prev) => prev.filter((n) => n.timestamp !== timestamp));
// // //   };

// // //   return (
// // //     <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, clearNotification, userType }}>
// // //       {children}
// // //     </NotificationContext.Provider>
// // //   );
// // // };

// // // export const useNotifications = () => {
// // //   const context = useContext(NotificationContext);
// // //   if (!context) {
// // //     throw new Error('useNotifications must be used within a NotificationProvider');
// // //   }
// // //   return context;
// // // };


// // // src/contexts/NotificationContext.js
// // import React, { createContext, useContext, useState, useEffect } from 'react';

// // const NotificationContext = createContext();

// // export function useNotifications() {
// //   return useContext(NotificationContext);
// // }

// // export function NotificationProvider({ children }) {
// //   const [notifications, setNotifications] = useState([]);
// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const [socket, setSocket] = useState(null);
// //   const userId = localStorage.getItem('userId'); // Or however you get the user ID

// //   // Connect to notification WebSocket
// //   useEffect(() => {
// //     if (!userId) return;
    
// //     const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// //     const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications/${userId}/`;
    
// //     const notificationSocket = new WebSocket(wsUrl);
    
// //     notificationSocket.onopen = () => {
// //       console.log('Notification WebSocket connected');
// //     };
    
// //     notificationSocket.onmessage = (event) => {
// //       const data = JSON.parse(event.data);
      
// //       // Handle new notification
// //       if (data.type === 'notification' || data.type === 'chat_notification') {
// //         // Add notification to the state
// //         setNotifications(prev => {
// //           // Avoid duplicates
// //           if (prev.some(n => n.id === data.id)) return prev;
// //           return [data, ...prev];
// //         });
        
// //         // Play notification sound
// //         const audio = new Audio('/notification-sound.mp3');
// //         audio.volume = 0.5;
// //         audio.play().catch(e => console.error('Error playing sound:', e));
        
// //         // Show browser notification if supported
// //         if ('Notification' in window && Notification.permission === 'granted') {
// //           new Notification(data.message, {
// //             icon: '/notification-icon.png'
// //           });
// //         }
// //       }
// //     };
    
// //     notificationSocket.onclose = () => {
// //       console.log('Notification WebSocket disconnected');
// //       setTimeout(() => {
// //         if (userId) {
// //           console.log('Attempting to reconnect...');
// //           setSocket(null); // This will trigger the effect to run again
// //         }
// //       }, 3000);
// //     };
    
// //     setSocket(notificationSocket);
    
// //     // Request notification permission
// //     if ('Notification' in window && Notification.permission !== 'granted' && 
// //         Notification.permission !== 'denied') {
// //       Notification.requestPermission();
// //     }
    
// //     return () => {
// //       if (notificationSocket) {
// //         notificationSocket.close();
// //       }
// //     };
// //   }, [userId]);
  
// //   // Update unread count whenever notifications change
// //   useEffect(() => {
// //     setUnreadCount(notifications.filter(n => !n.read).length);
// //   }, [notifications]);
  
// //   // Mark a notification as read
// //   const markAsRead = (notificationId) => {
// //     setNotifications(prev => 
// //       prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
// //     );
// //   };
  
// //   // Mark all notifications as read
// //   const markAllAsRead = () => {
// //     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
// //   };
  
// //   // Clear notifications for a specific chat
// //   const clearChatNotifications = (chatKey) => {
// //     setNotifications(prev => 
// //       prev.map(n => n.chat_key === chatKey ? { ...n, read: true } : n)
// //     );
// //   };
  
// //   const value = {
// //     notifications,
// //     unreadCount,
// //     markAsRead,
// //     markAllAsRead,
// //     clearChatNotifications
// //   };
  
// //   return (
// //     <NotificationContext.Provider value={value}>
// //       {children}
// //     </NotificationContext.Provider>
// //   );
// // }







// import { useState, useCallback } from 'react';
// import axios from 'axios';

// const useJobSearch = (baseURL, token, getImageForCache) => {
//   const [jobData, setJobData] = useState([]);
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchPerformed, setSearchPerformed] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchParams, setSearchParams] = useState({
//     keyword: '',
//     location: '',
//     suggestionType: '',
//   });
//   const [filters, setFilters] = useState({
//     jobtype: '',
//     jobmode: '',
//     experience: '',
//     lpa: '',
//     location: '',
//     datePosted: '',
//     salary: 0,
//     salaryType: 'annual',
//   });

//   const cacheKey = 'jobSearchCache';
//   const cacheTTL = 5 * 60 * 1000;

//   const getCachedResults = (query) => {
//     const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
//     if (cached.query === query && Date.now() - cached.timestamp < cacheTTL) {
//       return cached.data;
//     }
//     return null;
//   };

//   const setCacheResults = (query, data) => {
//     localStorage.setItem(
//       cacheKey,
//       JSON.stringify({ query, data, timestamp: Date.now() })
//     );
//   };

//   const fetchAllJobs = useCallback(async () => {
//     setLoading(true);
//     setSearchPerformed(false);
//     setError(null);
//     try {
//       if (!token) {
//         setError('Please log in to view jobs.');
//         setFilteredJobs([]);
//         return;
//       }

//       const cached = getCachedResults('all_jobs');
//       if (cached) {
//         console.log('Using cached all_jobs:', cached);
//         const activeJobs = cached.filter((job) => job.active);
//         activeJobs.forEach((job) => {
//           if (job.employer?.profile_pic) {
//             job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
//           }
//         });
//         setJobData(activeJobs);
//         setFilteredJobs(activeJobs);
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(`${baseURL}/api/empjob/getAlljobs/`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.status === 200) {
//         const jobs = Array.isArray(response.data) ? response.data : [];
//         const activeJobs = jobs.filter((job) => job.active);
//         activeJobs.forEach((job) => {
//           if (job.employer?.profile_pic) {
//             job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
//           }
//         });
//         setJobData(activeJobs);
//         setFilteredJobs(activeJobs);
//         setCacheResults('all_jobs', activeJobs);
//         setError(null);
//       } else {
//         setError('Failed to fetch job data.');
//         setFilteredJobs([]);
//       }
//     } catch (error) {
//       console.error('fetchAllJobs error:', {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message,
//       });
//       if (error.response?.status === 401) {
//         setError('Session expired. Please log in again.');
//         localStorage.removeItem('access');
//       } else {
//         setError('An error occurred while fetching jobs.');
//       }
//       setFilteredJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, getImageForCache, baseURL]);

//   const handleSearch = useCallback(
//     async (updatedFilters = filters, updatedSearchParams = searchParams) => {
//       if (isSearching) {
//         console.log('Search skipped: already searching');
//         return;
//       }

//       setIsSearching(true);
//       setLoading(true);
//       setSearchPerformed(true);

//       const queryParams = new URLSearchParams();

//       if (updatedSearchParams.keyword && updatedSearchParams.suggestionType) {
//         const type = updatedSearchParams.suggestionType;
//         if (type === 'title') {
//           queryParams.append('search', updatedSearchParams.keyword);
//         } else if (type === 'jobtype') {
//           queryParams.append('jobtype', updatedSearchParams.keyword);
//         } else if (type === 'jobmode') {
//           queryParams.append('jobmode', updatedSearchParams.keyword);
//         } else if (type === 'industry') {
//           queryParams.append('industry', updatedSearchParams.keyword);
//         } else {
//           const keywords = updatedSearchParams.keyword
//             .toLowerCase()
//             .trim()
//             .split(/\s+/);
//           if (keywords.length > 0 && keywords[0]) {
//             queryParams.append('title', keywords.join(' '));
//           }
//         }
//       } else if (updatedSearchParams.keyword) {
//         const keywords = updatedSearchParams.keyword
//           .toLowerCase()
//           .trim()
//           .split(/\s+/);
//         if (keywords.length > 0 && keywords[0]) {
//           queryParams.append('title', keywords.join(' '));
//         }
//       }

//       if (updatedSearchParams.location) {
//         queryParams.append('location', updatedSearchParams.location);
//       }

//       if (updatedFilters.jobtype) {
//         queryParams.append('jobtype', updatedFilters.jobtype);
//       }
//       if (updatedFilters.jobmode) {
//         queryParams.append('jobmode', updatedFilters.jobmode);
//       }
//       if (updatedFilters.experience) {
//         queryParams.append('experience', updatedFilters.experience);
//       }
//       if (updatedFilters.lpa) {
//         queryParams.append('lpa', updatedFilters.lpa);
//       }
//       if (updatedFilters.location && !updatedSearchParams.location) {
//         queryParams.append('location', updatedFilters.location);
//       }
//       if (updatedFilters.datePosted) {
//         queryParams.append('recent', updatedFilters.datePosted);
//       }
//       if (updatedFilters.salary && updatedFilters.salary > 0) {
//         queryParams.append('lpa', updatedFilters.salary);
//       }
//       queryParams.append('active', 'true');

//       const queryString = queryParams.toString();
//       const cached = getCachedResults(queryString);
//       if (cached && cached.length > 0) {
//         cached.forEach((job) => {
//           if (job.employer?.profile_pic) {
//             job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
//           }
//         });
//         setFilteredJobs(cached);
//         setError(null);
//         setLoading(false);
//         setIsSearching(false);
//         return;
//       }

//       try {
//         if (!token) {
//           setError('Please log in to search jobs.');
//           setFilteredJobs([]);
//           return;
//         }

//         const response = await axios.get(
//           `${baseURL}/api/empjob/search/?${queryString}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               Accept: 'application/json',
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         if (response.status === 200) {
//           const jobs = Array.isArray(response.data)
//             ? response.data
//             : response.data.results && Array.isArray(response.data.results)
//             ? response.data.results
//             : [];
//           const activeJobs = jobs.filter((job) => job.active);
//           activeJobs.forEach((job) => {
//             if (job.employer?.profile_pic) {
//               job.employer.formattedProfilePic = getImageForCache(job.employer.profile_pic);
//             }
//           });
//           setFilteredJobs(activeJobs);
//           setCacheResults(queryString, activeJobs);
//           setError(null);
//         } else {
//           setError('No jobs found matching your criteria.');
//           setFilteredJobs([]);
//         }
//       } catch (error) {
//         console.error('Search error:', {
//           status: error.response?.status,
//           data: error.response?.data,
//           message: error.message,
//         });
//         if (error.response?.status === 401) {
//           setError('Session expired. Please log in again.');
//           localStorage.removeItem('access');
//         } else {
//           setError('Error during search. Please try again.');
//         }
//         setFilteredJobs([]);
//       } finally {
//         setLoading(false);
//         setIsSearching(false);
//       }
//     },
//     [filters, searchParams, token, isSearching, getImageForCache, baseURL]
//   );

//   const debounce = (func, wait) => {
//     let timeout;
//     return (...args) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => func(...args), wait);
//     };
//   };

//   const debouncedHandleSearch = debounce(() => handleSearch(filters, searchParams), 300);

//   const handleSearchInputChange = (e) => {
//     const { name, value, suggestionType } = e.target || e;
//     setSearchParams((prev) => ({
//       ...prev,
//       [name]: value,
//       suggestionType: suggestionType || '',
//     }));
//   };

//   const resetFilters = () => {
//     setSearchParams({ keyword: '', location: '', suggestionType: '' });
//     setFilters({
//       jobtype: '',
//       jobmode: '',
//       experience: '',
//       lpa: '',
//       location: '',
//       datePosted: '',
//       salary: 0,
//       salaryType: 'annual',
//     });
//     fetchAllJobs();
//   };

//   return {
//     jobData,
//     filteredJobs,
//     loading,
//     error,
//     searchPerformed,
//     isSearching,
//     searchParams,
//     filters,
//     setFilters,
//     fetchAllJobs,
//     handleSearch,
//     debouncedHandleSearch,
//     handleSearchInputChange,
//     resetFilters,
//   };
// };

// export default useJobSearch;



// import React, { useState, useEffect, useCallback } from 'react';
// import JobCard from './utilities/Jobcard';
// import Pagination from './utilities/Paginations';
// import BlinkingArrow from './utilities/BlinkingArow';
// import SearchBox from './utilities/SearchBox';
// import QuickFilterDropdowns from './utilities/Filter';
// import '../../assets/component/Findjob.css';
// import useJobSearch from './useJobSearch';

// function CandidateHome() {
//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');
//   const itemsPerPage = 6;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [imageCache, setImageCache] = useState({});

//   const getImageForCache = useCallback(
//     (imageUrl) => {
//       if (!imageUrl) return null;
//       if (imageUrl.startsWith('http')) {
//         return imageUrl;
//       }
//       const formattedUrl = imageUrl.startsWith('/')
//         ? `${baseURL}${imageUrl}`
//         : `${baseURL}/${imageUrl}`;
//       if (imageCache[formattedUrl]) {
//         return formattedUrl;
//       }
//       const img = new Image();
//       img.src = formattedUrl;
//       img.onload = () => {
//         setImageCache((prev) => ({
//           ...prev,
//           [formattedUrl]: true,
//         }));
//       };
//       img.onerror = () => {
//         console.warn('Failed to load image:', formattedUrl);
//       };
//       return formattedUrl;
//     },
//     [baseURL, imageCache]
//   );

//   const {
//     jobData,
//     filteredJobs,
//     loading,
//     error,
//     searchPerformed,
//     isSearching,
//     searchParams,
//     filters,
//     setFilters,
//     fetchAllJobs,
//     handleSearch,
//     debouncedHandleSearch,
//     handleSearchInputChange,
//     resetFilters,
//   } = useJobSearch(baseURL, token, getImageForCache);

//   useEffect(() => {
//     fetchAllJobs();
//   }, [fetchAllJobs]);

//   const getCurrentJobs = () => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredJobs.slice(startIndex, startIndex + itemsPerPage);
//   };

//   const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

//   if (loading) {
//     return (
//       <div className="find-job-page-h1233">
//         <div className="loading-container-h1233">
//           <div className="spinner-h1233"></div>
//           <p>Loading job listings...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="find-job-page-h1233">
//       <div className="find-job-header-h1233">
//         <h1 style={{ color: '#3e71b5' }}>Find Your Next Opportunity</h1>
//         <p>Browse through hundreds of job listings tailored for you</p>
//       </div>

//       <SearchBox
//         searchParams={searchParams}
//         handleSearchInputChange={handleSearchInputChange}
//         handleSearch={() => handleSearch(filters, searchParams)}
//         isSearching={isSearching}
//       />

//       <QuickFilterDropdowns
//         filters={filters}
//         setFilters={setFilters}
//         handleSearch={handleSearch}
//         jobData={jobData}
//         setFilteredJobs={setFilteredJobs}
//         isSearching={isSearching}
//         onResetAllFilters={resetFilters}
//       />

//       {error && (
//         <div className="error-container-h1233">
//           <p className="error-text-h1233">{error}</p>
//           <button onClick={resetFilters} className="reset-filters-button">
//             Reset Filters
//           </button>
//         </div>
//       )}

//       <div className="jobs-content-area">
//         <div className="search-status">
//           <p className="activejobs">
//             {filteredJobs.length} active job{filteredJobs.length !== 1 ? 's' : ''} found
//           </p>
//           {searchPerformed && filteredJobs.length === 0 && (
//             <button onClick={fetchAllJobs} className="view-all-jobs-button">
//               View All Available Jobs
//             </button>
//           )}
//         </div>

//         <div className="job-cards-container-h1233">
//           {getCurrentJobs().length > 0 ? (
//             getCurrentJobs().map((job) => (
//               <JobCard
//                 key={job.id}
//                 id={job.id}
//                 baseURL={baseURL}
//                 img={job.employer?.formattedProfilePic}
//                 title={job.title}
//                 posted={job.posteDate}
//                 applybefore={job.applyBefore}
//                 empname={job.employer?.user?.full_name || 'Unknown Company'}
//                 experience={job.experience}
//                 jobmode={job.jobmode}
//                 jobtype={job.jobtype}
//                 location={job.location}
//                 salary={job.lpa}
//                 getImageForCache={getImageForCache}
//               />
//             ))
//           ) : (
//             <div className="no-jobs-message-h1233">
//               <p>No active jobs match your current filters</p>
//               <BlinkingArrow onClick={fetchAllJobs} />
//               <p>Click to see all available active jobs</p>
//             </div>
//           )}
//         </div>

//         {totalPages > 1 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default CandidateHome;