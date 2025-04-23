// src/utils/index.js
export const getImageForCache = (imageUrl, baseURL) => {
  if (!imageUrl) {
    console.log('No image URL provided');
    return '/images/default-job-img.png';
  }

  let formattedUrl = imageUrl;
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/media/')) {
    formattedUrl = `${baseURL}/media/${imageUrl.replace(/^\/?/, '')}`;
  } else if (imageUrl.startsWith('/')) {
    formattedUrl = `${baseURL}${imageUrl}`;
  }

  console.log('Formatted image URL:', formattedUrl);
  return formattedUrl;
};