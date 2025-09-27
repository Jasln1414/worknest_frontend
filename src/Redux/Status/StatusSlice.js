// // src/features/applicationJobs/applicationJobsSlice.js

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const baseURL = 'http://127.0.0.1:8000';




// export const fetchApplicationJobs = createAsyncThunk(
//   'applicationJobs/fetchApplicationJobs',
//   async (token, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${baseURL}/api/empjob/getApplicationjobs/`, {
//         headers: {
//           'Authorization':`Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // Rest of your slice code remains the same...

// const applicationJobsSlice = createSlice({
//   name: 'applicationJobs',
//   initialState: {
//     jobs: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     updateJobStatus: (state, action) => {
//       const { id, newStatus } = action.payload;
//       const index = state.jobs.findIndex(job => job.id === id);
//       if (index !== -1) {
//         state.jobs[index].status = newStatus;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchApplicationJobs.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchApplicationJobs.fulfilled, (state, action) => {
//         state.loading = false;
//         state.jobs = action.payload;
//       })
//       .addCase(fetchApplicationJobs.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { updateJobStatus } = applicationJobsSlice.actions;
// export default applicationJobsSlice.reducer;



















// src/features/applicationJobs/applicationJobsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000';

export const fetchApplicationJobs = createAsyncThunk(
  'applicationJobs/fetchApplicationJobs',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/empjob/getApplicationjobs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const applicationJobsSlice = createSlice({
  name: 'applicationJobs',
  initialState: {
    jobs: [], // Store all job data
    selectedJob: null, // Store the selected job
    current: null, // Store the selected candidate
    loading: false,
    error: null,
  },
  reducers: {
    updateJobStatus: (state, action) => {
      const { id, newStatus } = action.payload;
      const index = state.jobs.findIndex((job) => job.id === id);
      if (index !== -1) {
        state.jobs[index].status = newStatus;
      }
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    setCurrentCandidate: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        // Set the first job as selectedJob on initial load
        state.selectedJob = action.payload[0] || null;
      })
      .addCase(fetchApplicationJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateJobStatus, setSelectedJob, setCurrentCandidate } = applicationJobsSlice.actions;
export default applicationJobsSlice.reducer;
