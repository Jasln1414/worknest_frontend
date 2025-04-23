import React, { useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// const baseURL = import.meta.env.VITE_API_BASEURL
const baseURL = 'http://127.0.0.1:8000'
function randomID(len) {
  let result = '';
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  var maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

const InterviewRoom =() => {

    const { id } = useParams();
    // const baseURL = 'http://127.0.0.1:8000';
    const roomID = getUrlParams().get('roomID') || randomID(5);

    useEffect(() => {
      const makeInterview = async () => {
        const formData = new FormData();
        formData.append("roomId", roomID);
        formData.append("interviewId", id);
        try {
          const response = await axios.post(baseURL + '/api/interview/interviewCall/', formData);
          // console.log(response);
        } catch (error) {
          // console.log(error);
        }
      };
      makeInterview();
    }, [id, roomID, baseURL]);

  const myMeeting = async (element) => {
    const appID = 1507808672;
    const serverSecret = "d94bbed8bb4ead40be5c107dac49783f";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Personal link',
          url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });
  };

  return (
    <div
      className="myCallContainer"
      ref={(element) => {
        if (element) myMeeting(element);
      }}
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
}
export default InterviewRoom