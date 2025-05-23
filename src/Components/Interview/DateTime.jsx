// DateTime.jsx
import { isAfter, parseISO, addMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const timeZone = 'America/New_York';

// Check if the interview time has been reached
export const isInterviewTimeReached = (dateString) => {
  if (!dateString) return false;
  const interviewDate = parseISO(dateString); // Assume dateString is in UTC
  const currentDate = new Date(); // Current time in UTC
  return isAfter(currentDate, interviewDate);
};

// Check if the interview is within the start window (e.g., 30 minutes before to 15 minutes after)
export const isInterviewStartable = (dateString) => {
  if (!dateString) return false;
  const interviewDate = parseISO(dateString); // Assume dateString is in UTC
  const currentDate = new Date(); // Current time in UTC
  const startWindowStart = addMinutes(interviewDate, -30); // 30 minutes before
  const startWindowEnd = addMinutes(interviewDate, 15); // 15 minutes after
  return isAfter(currentDate, startWindowStart) && !isAfter(currentDate, startWindowEnd);
};

// Extract date in a readable format
export const extractDate = (dateString) => {
  if (!dateString) return 'Not available';
  return formatInTimeZone(parseISO(dateString), timeZone, 'EEE, d MMM yyyy');
};

// Extract time in a readable format
export const extractTime = (dateString) => {
  if (!dateString) return 'Not available';
  return formatInTimeZone(parseISO(dateString), timeZone, 'h:mm a');
};