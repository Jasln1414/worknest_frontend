













import React, { useEffect, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
import './Interview.css';

const baseURL = 'http://127.0.0.1:8000';

function randomID(len) {
  let result = '';
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  const urlStr = url.split('?')[1] || '';
  return new URLSearchParams(urlStr);
}

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authentication_user || { usertype: '', companyName: null });
  const roomID = getUrlParams().get('roomID') || randomID(5);
  const [isLoadingUserType, setIsLoadingUserType] = useState(false);
  const token = localStorage.getItem('access');
  const url = `${window.location.protocol}//${window.location.host}/interview/${id}?roomID=${roomID}`;

  const interview_id=parseInt(id)
  console.log('Token:', token);

  useEffect(() => {
    interviewJoinStatus()

  }, [token]);



const interviewJoinStatus = async () => {
  try {
    const response = await axios.post(
      `${baseURL}/api/interview/interviewjoinstatus/${interview_id}/`,
      {}, // empty data object since you're not sending any data
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Interview marked as Completed', response.data);
  } catch (error) {
    console.error('Error marking interview as Completed:', error.response || error.message);
  }
};

// const interviewJoinStatus=async () => {
//     try{
      
//       const response= await axios.post(
//          `${baseURL}/api/interview/interviewjoinstatus/${interview_id}/`,
      
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },

//         }
//       );
//       console.log('Interview marked as Completeddddddddddddddddddddddddddddddddddd',response.data);
//     } catch (error) {
//       console.error('Error marking interview as Completed:', error.response || error.message);
//     }
//   };
    
  

  


  // Mark interview as completed
  const markInterviewCompleted = async () => {
    try {
      await axios.post(
        `${baseURL}/api/interview/status/${id}/`,
        { action: 'Completed' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Interview marked as Completed');
    } catch (error) {
      console.error('Error marking interview as Completed:', error.response || error.message);
    }
  };

  // useEffect(() => {
  //   const makeInterview = async () => {
  //     const formData = new FormData();
  //     formData.append('roomId', roomID);
  //     formData.append('interviewId', id);
  //     try {
  //       const response = await axios.post(`${baseURL}/api/interview/interviewCall/`, formData, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           Accept: 'application/json',
  //         },
  //       });
  //       console.log('Interview API response:', response.data);
  //     } catch (error) {
  //       console.error('Interview API error:', error.response || error.message);
  //     }
  //   };
  //   makeInterview();
  // }, [id, roomID, token]);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!authentication_user.usertype) {
        setIsLoadingUserType(true);
        try {
          const response = await axios.get(`${baseURL}/api/account/user/details`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          if (response.status === 200) {
            console.log('Fetched user details:', response.data);
            const userType = response.data.data.is_employer ? 'employer' : 'candidate';
            dispatch(
              set_Authentication({
                ...authentication_user,
                name: response.data.data.name,
                email: response.data.data.email,
                userid: response.data.data.user_id,
                companyName: response.data.data.companyName || null,
                isAuthenticated: true,
                isAdmin: response.data.data.isAdmin || false,
                usertype: userType,
              })
            );
          }
        } catch (error) {
          console.error('Error fetching user details:', error.response || error.message);
          if (error.response?.status === 401) {
            console.warn('Unauthorized, redirecting to login');
            navigate('/login');
          }
        } finally {
          setIsLoadingUserType(false);
        }
      }
    };
    fetchUserType();
  }, [authentication_user.usertype, dispatch, navigate, token]);

  useEffect(() => {
    const handleSend = async () => {
      try {
        const response = await axios.post(
          `${baseURL}/api/interview/link/${id}/`,
          { link: url },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Link sent response:', response.data);
      } catch (error) {
        console.error('Error sending link:', error.response || error.message);
      }
    };

    if (authentication_user.usertype === 'employer') {
      handleSend();
    }
  }, [id, url, token, authentication_user.usertype]);

  // Cleanup on component unmount (e.g., when leaving the interview)
  useEffect(() => {
    return () => {
      markInterviewCompleted();
    };
  }, [id, token]);

  const myMeeting = async (element) => {
    const appID = 223232856;
    const serverSecret = '15878ba5977a690019bcf7a287e24bca';
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Interview Link',
          url: url,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });
  };

  const handleBackClick = () => {
    markInterviewCompleted(); // Mark as completed when clicking Back
    if (authentication_user.usertype === 'employer') {
      navigate('/employer/EmpHome');
    } else if (authentication_user.usertype === 'candidate') {
      navigate('/candidate/applyedjobs');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="interview-room-wrapper">
      <Button
        variant="contained"
        startIcon={<ArrowBack />}
        className="back-button"
        onClick={handleBackClick}
        disabled={isLoadingUserType}
      >
        {isLoadingUserType ? 'Loading...' : 'Back to Dashboard'}
      </Button>
      <div
        className="myCallContainer"
        ref={(element) => {
          if (element) myMeeting(element);
        }}
        style={{ width: '100vw', height: '100vh' }}
      ></div>
    </div>
  );
};

export default InterviewRoom;