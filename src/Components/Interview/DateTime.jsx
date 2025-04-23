export const extractDate = (datetimeString) => {
    const dateObject = new Date(datetimeString);
    const datePart = dateObject.toISOString().split('T')[0]; 
    return datePart;
};

export const extractTime = (datetimeString) => {
    const dateObject = new Date(datetimeString);
    let hours = dateObject.getUTCHours();
    const minutes = String(dateObject.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const timePart = `${hours}:${minutes} ${ampm}`;
    return timePart;
};

export  const isInterviewTimeReached = (datetimeString, id) => {
    const interviewDate = extractDate(datetimeString); 
    const interviewTime = extractTime(datetimeString);
    const interviewDateTime = new Date(`${interviewDate} ${interviewTime}`);
    const n = new Date();
    
    console.log(n);
    const date = n.toLocaleDateString();
    const time = n.toLocaleTimeString();
    // console.log("date time ...............ayooo", date, time);
    const currentDateTime = new Date(`${date} ${time}`);
    if (interviewDateTime >= currentDateTime) {
        console.log(true);
    } else {
        console.log(false);
    }
    console.log("xe5cr6vtby8nimx6rc7vyb8uxr6cvybn",interviewDateTime <= currentDateTime)
    return interviewDateTime <= currentDateTime
  };