import React, { useRef, useState, useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { IoSend, IoAttach, IoClose } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './chat.css';
function ChatModal({
  setChat,
  profile_pic,
  userName,
  emp_name,
  candidate_id,
  employer_id,
  senderName,
  currentUserId,
   receiverId, 
}) {
  const modalRef = useRef();
  const chatMessagesRef = useRef(null);
  const clientRef = useRef(null);
  const fileInputRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [websocketStatus, setWebsocketStatus] = useState('connecting');
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  const user_Id = useSelector((state) => state.authentication_user.userid);

  console.log("ChatModal props.......................................:", {
  setChat,
  profile_pic,
  userName,
  emp_name,
  candidate_id,
  employer_id,
  senderName,
  currentUserId,
   receiverId, 
  });
  

  // Resolve user_id
  const storedUserId = localStorage.getItem('user_id');
  const user_id = currentUserId || (storedUserId && storedUserId !== 'null' && storedUserId !== 'undefined' ? storedUserId : employer_id);

  // Role determination
  const isEmployer = String(user_id) === String(employer_id);
  const otherUserId = isEmployer ? candidate_id : employer_id;
  const actualSenderName = senderName || (isEmployer ? emp_name : userName);
  const otherUserName = isEmployer ? userName : emp_name;


  console.log("userrrrrrrrrrrrrrr",{

    
  })

  const [chattApprove, setChatApprove] = useState(false);
  const [chatisRequested, setChatRequested] = useState(false);
  const [chatisRejected, setChatRejected] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [approvalId, setApprovalId] = useState(null);

  useEffect(() => {
    if (!chattApprove) {
      fetchChatApprove();
    }
  }, []);

  const fetchChatApprove = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/empjob/getApproval/${candidate_id}/${employer_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setChatApprove(response.data.is_approved);
        setChatRequested(response.data.is_requested);
        setChatRejected(response.data.is_rejected);
        setApprovalId(response.data.id);
        setRequestMessage(response.data.message);
      } else {
        setChatApprove(false);
      }
    } catch (error) {
      // Error handling without console.log
    }
  };

  const handleChatRequest = async (action) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/empjob/approveChat/${approvalId}/`,
        {
          action: action,
          message: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        fetchChatApprove();
      }
    } catch (error) {
      // Error handling without console.log
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      setChat(false);
      if (clientRef.current && clientRef.current.readyState === WebSocket.OPEN) {
        clientRef.current.close();
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${baseURL}/chat/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setIsUploading(false);
      return response.data.file_url;
    } catch (error) {
      setIsUploading(false);
      return null;
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;
    const fileType = selectedFile.type.split('/')[0];
    const fileName = selectedFile.name;
    return (
      <div className="file-preview">
        {fileType === 'image' ? (
          <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="file-preview-image" />
        ) : fileType === 'video' ? (
          <video src={URL.createObjectURL(selectedFile)} controls className="file-preview-video" style={{ maxWidth: '200px' }} />
        ) : (
          <div className="file-preview-generic">
            <div className="file-icon">📄</div>
            <div className="file-name">{fileName}</div>
          </div>
        )}
        <button onClick={removeFile} className="file-remove-button">
          <IoClose size={16} />
        </button>
      </div>
    );
  };

  useEffect(() => {
    const connectToWebSocket = () => {
      if (!candidate_id || !employer_id) {
        return;
      }
      setWebsocketStatus('connecting');
      const wsUrl = `ws://127.0.0.1:8000/ws/chat/${String(candidate_id)}/${String(employer_id)}/${String(user_id)}/`;
      const newClient = new W3CWebSocket(wsUrl);
      clientRef.current = newClient;

      newClient.onopen = () => {
        setWebsocketStatus('connected');
        loadChatHistory();
        requestActiveUsersList();
      };

      newClient.onmessage = (message) => {
        const data = JSON.parse(message.data);


        console.log("onmesagggggggggggggggggg",message.data);
        

        if (data.type === 'active_users') {
          handleActiveUsersUpdate(data.users);
          return;
        }

        if (!data.id) data.id = generateMessageId();
        if (!data.sender_id && data.sendername) {
          data.sender_id = data.sendername === actualSenderName ? user_id : otherUserId;
        }

        setChatMessages((prev) => {
          const pendingIndex = prev.findIndex(
            (msg) =>
              msg.status === 'sending' &&
              msg.message === data.message &&
              (String(msg.sender_id) === String(data.sender_id) || msg.sendername === data.sendername)
          );
          if (pendingIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[pendingIndex] = { ...updatedMessages[pendingIndex], ...data, status: 'sent' };
            return updatedMessages;
          }
          const isDuplicate = prev.some(
            (msg) =>
              msg.message === data.message &&
              msg.sendername === data.sendername &&
              (!data.timestamp || !msg.timestamp || Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 5000)
          );
          return isDuplicate ? prev : [...prev, data];
        });
      };

      newClient.onclose = () => {
        setWebsocketStatus('disconnected');
        setOtherUserOnline(false);
      };

      newClient.onerror = (error) => {
        setWebsocketStatus('error');
      };
    };

    connectToWebSocket();

    const loadChatHistory = async () => {
      try {
        const response = await axios.get(`${baseURL}/chat/messages/${candidate_id}/${employer_id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && Array.isArray(response.data)) {
          const processedMessages = response.data.map((msg) => ({
            ...msg,
            sender_id: msg.sendername === actualSenderName ? user_id : otherUserId,
          }));
          setChatMessages(processedMessages);
        }
      } catch (error) {
        // Error handling without console.log
      }
    };

    const heartbeatInterval = setInterval(() => {
      if (clientRef.current && clientRef.current.readyState === WebSocket.OPEN) {
        requestActiveUsersList();
      }
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
      if (clientRef.current && clientRef.current.readyState === WebSocket.OPEN) {
        clientRef.current.close();
      }
    };
  }, [candidate_id, employer_id, user_id, token, actualSenderName, otherUserId]);

  const requestActiveUsersList = () => {
    if (clientRef.current && clientRef.current.readyState === WebSocket.OPEN) {
      clientRef.current.send(JSON.stringify({ type: 'get_active_users' }));
    }
  };

  const handleActiveUsersUpdate = (activeUsers) => {
    const stringActiveUsers = activeUsers.map(String);
    const stringOtherUserId = String(otherUserId);
    const isOtherUserActive = stringActiveUsers.includes(stringOtherUserId);
    setOtherUserOnline(isOtherUserActive);
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !clientRef.current || websocketStatus !== 'connected') return;
    let fileUrl = null;
    if (selectedFile) {
      fileUrl = await handleFileUpload(selectedFile);
      if (!fileUrl) return;
    }
    const messageId = generateMessageId();
    const timestamp = new Date().toISOString();
    const messageContent = fileUrl ? `${message.trim()} ${fileUrl}` : message.trim();

    const messageData = {
      id: messageId,
      message: messageContent,
      sendername: actualSenderName,
      timestamp,
      is_read: otherUserOnline,
      status: 'sending',
      file_url: fileUrl || null,
      sender_id: user_id,
      reciverId: receiverId,
      se_id: user_Id
    };

    setChatMessages((prev) => [...prev, messageData]);
    setMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const serverMessageData = {
      message: messageContent,
      sendername: actualSenderName,
      timestamp,
      file_url: fileUrl || null,
      sender_id: user_id,
      reciverId: receiverId,
      se_id: user_Id
    };

    try {
      clientRef.current.send(JSON.stringify(serverMessageData));
    } catch (error) {
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'failed' } : msg))
      );
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const renderFileMessage = (msg) => {
    const url = msg.file_url || (msg.message && msg.message.match(/https?:\/\/[^\s\]]+/)?.[0]);
    if (!url) return null;
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={url} alt="Chat attachment" className="chat-image" />;
    } else if (url.match(/\.(mp4|webm)$/i)) {
      return <video src={url} controls className="chat-video" style={{ maxWidth: '300px' }} />;
    } else {
      return <a href={url} target="_blank" rel="noopener noreferrer" className="file-download-link">Download File</a>;
    }
  };

  const displayMessageText = (messageText) => {
    if (!messageText) return '';
    return messageText.replace(/https?:\/\/[^\s\]]+/, '').trim();
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);









  
  return (
    <div ref={modalRef} onClick={closeModal} className="unique-chat-modal-overlay-emp">
      <div className="unique-chat-modal-container">
        <div className="unique-chat-modal-header">
          <div className="unique-chat-modal-profile-pic">
            <img src={profile_pic || '/default-avatar.png'} alt="user" />
          </div>
          <div className="user-status-wrapper">
            <p className="unique-chat-modal-username">{otherUserName}</p>
            {/* <span className={`user-status ${otherUserOnline ? 'online' : 'offline'}`}>
              {otherUserOnline ? 'Online' : 'Offline'}
            </span> */}
          </div>
        </div>
        <div className="unique-chat-messages" ref={chatMessagesRef}>
          {websocketStatus === 'connecting' && chattApprove === true && <div className="loading-message">Connecting to chat...</div>}
          {websocketStatus === 'error' && (
            <div className="connection-error-message">Unable to connect to chat server. Please try again later.</div>
          )}
          {websocketStatus === 'connected' && chatMessages.length === 0 ? (
            <div className="no-messages">No messages yet. Start the conversation!</div>
          ) : (
            chatMessages.map((msg) => {
              const isCurrentUser = String(msg.sender_id) === String(user_id);
              return (
                <div className="unique-chat" key={msg.id || generateMessageId()}>
                  <div className={`unique-chat-message-${msg.se_id===user_Id ? 'right' : 'left'}`}>
                    <div className={`unique-chat-message-bubble ${msg.status === 'failed' ? 'failed' : ''}`}>
                      <strong>{msg.sendername}</strong>
                      {msg.message && <p>{displayMessageText(msg.message)}</p>}
                      <div className="message-file">{renderFileMessage(msg)}</div>
                      <div className="message-timestamp">
                        {formatTimestamp(msg.timestamp)}
                        {msg.status === 'sending' && <span className="message-status"> • Sending...</span>}
                        {msg.status === 'failed' && <span className="message-status error"> • Failed</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {chatisRequested && (
          <div className="unique-chat-approval-box">
            <p className="unique-chat-approval-label">User is request to send message with a message.</p>
            <p className="unique-chat-approval-message">{requestMessage}</p>
            <button className="unique-chat-approve-button" onClick={() => handleChatRequest("approved")}>Approve</button>
            <button className="unique-chat-reject-button" onFriendClick={() => handleChatRequest("rejected")}>Reject</button>
          </div>
        )}

        <div className="unique-chat-input-container">
          {selectedFile && renderFilePreview()}
          <div className="unique-chat-input-wrapper">
            <button
              className="file-attach-button"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading || websocketStatus !== 'connected'}
            >
              <IoAttach size={20} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                disabled={isUploading || websocketStatus !== 'connected'}
              />
            </button>
            <textarea
              placeholder="Type your message..."
              name="message"
              id="message"
              rows={1}
              onChange={handleTextareaChange}
              value={message}
              className="unique-chat-input"
              disabled={websocketStatus !== 'connected' || isUploading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              className="unique-chat-send-button"
              onClick={sendMessage}
              disabled={websocketStatus !== 'connected' || (!message.trim() && !selectedFile) || isUploading}
            >
              {isUploading ? <div className="loading-spinner"></div> : <IoSend size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatModal;