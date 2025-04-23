import * as Yup from 'yup';

// Helper function to parse salary strings to annual USD
const parseSalaryToUSD = (salaryStr) => {
  if (!salaryStr) return 0;
  const str = salaryStr.toLowerCase().trim();

  if (str.includes('/hr') || str.includes('/hour')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return num * 40 * 52; // Convert hourly to annual (40 hrs/week, 52 weeks)
  } else if (str.includes('k')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return num * 1000; // Convert $K to annual USD
  }
  return parseFloat(str); // Fallback to numeric value (assumed annual)
};

export const initialValue = {
  title: "",
  location: "",
  saleryfrom: "", // e.g., "$20K" or "$20/Hour"
  saleryto: "",   // e.g., "$30K" or "$30/Hour"
  applyBefore: "",
  experience: "",
  jobmode: "",
  jobtype: "",
  about: "",
  responsibility: ""
};

export const PostJobValidationSchema = Yup.object().shape({
  // title: Yup.string()
  //   .required('Title is required')
  //   .matches(/^[A-Z]/, 'Start with an uppercase letter'),
  // title: Yup.string()
  // .required('Title is required')
  // .matches(/^[A-Z]/, 'Title must start with an uppercase letter')
  // .min(5, 'Title must be at least 5 characters')
  // .max(100, 'Title must be less than 150 characters'),
  // // .matches(/^[A-Za-z0-9\s]+$/, 'Title can only contain letters, numbers, and spaces')
  // // .notOneOf(['Job', 'Post', 'New'], 'Title cannot be a generic word like "Job", "Post", or "New"'),
  title: Yup.string()
  .required('Title is required')
  .matches(/^[A-Z]/, 'Title must start with an uppercase letter')
  .min(5, 'Title must be at least 5 characters')
  .max(200, 'Title must be less than 200 characters')  // Adjusting max length for longer titles
  .matches(/^[A-Za-z0-9\s\-\.\,\/\&]+$/, 'Title can only contain letters, numbers, spaces, hyphens, periods, commas, slashes, and ampersands')  // Allowing specific special characters
  .notOneOf(['Job', 'Post', 'New'], 'Title cannot be a generic word like "Job", "Post", or "New"'),


  location: Yup.string()
    .required('Location is required')
    .matches(/^[a-zA-Z0-9\s,.-]*$/, 'Location can only contain letters, numbers, spaces, commas, periods, and hyphens'),
  saleryfrom: Yup.string()
    .required('Salary from is required')
    .matches(/^\$?\d+(\.\d+)?([kK]|\/[hH](our|r))?$/,
      'Salary must be in format like "$20K" or "$20/Hour"')
    .test('positive', 'Salary from must be greater than 0', value => parseSalaryToUSD(value) > 0),
  saleryto: Yup.string()
    .required('Salary to is required')
    .matches(/^\$?\d+(\.\d+)?([kK]|\/[hH](our|r))?$/,
      'Salary must be in format like "$30K" or "$30/Hour"')
    .test('greater-than-from', 'Must be greater than Salary from',
      function (value) {
        const saleryfrom = this.parent.saleryfrom;
        if (!saleryfrom || !value) return true;
        return parseSalaryToUSD(value) > parseSalaryToUSD(saleryfrom);
      }),
  applyBefore: Yup.date()
    .required('Apply before date is required')
    .min(new Date(), 'Apply before date must be in the future'),
  experience: Yup.string().required('Experience is required'),
  jobmode: Yup.string().required('Job mode is required'),
  jobtype: Yup.string().required('Job type is required'),
  about: Yup.string()
    .required('About is required')
    .min(20, 'About must be at least 20 characters')
    .max(5000, 'About must be less than 5000 characters'),
  responsibility: Yup.string()
    .required('Responsibilities are required')
    .min(20, 'Responsibilities must be at least 20 characters')
    .max(5000, 'Responsibilities must be less than 5000 characters')
});