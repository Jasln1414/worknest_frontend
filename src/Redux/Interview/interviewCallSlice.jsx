import { createSlice } from '@reduxjs/toolkit';

const interviewCallSlice = createSlice({
    name: 'interview_call',
    initialState: {
      interviewModal: false,
      roomId: null,
      interviewId: null,
    },
    reducers: {
      openInterviewModal: (state) => {
        console.log("checkingggggggggggggggggopendddddddd",);
        
        state.interviewModal = true;
      },
      closeInterviewModal: (state) => {
        console.log("closedddddddddddddddddd");
        
        state.interviewModal = false;
      },
      setInterviewDetails: (state, action) => {
        const { roomId, interviewId } = action.payload;
        state.roomId = roomId;
        state.interviewId = interviewId;
      },
    },
  });

export const { openInterviewModal, closeInterviewModal, setInterviewDetails } = interviewCallSlice.actions;
export default interviewCallSlice.reducer;