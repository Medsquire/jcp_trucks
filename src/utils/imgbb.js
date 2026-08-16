import axios from 'axios';

const API_KEY = '37bda322a74f0fd35f2f0e0631cbf5ea';

export const uploadToImgbb = async (base64Image) => {
  try {
    // Remove the data:image/jpeg;base64, part
    const base64Data = base64Image.split(',')[1];
    
    const formData = new FormData();
    formData.append('image', base64Data);
    
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, formData);
    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading image to Imgbb:', error);
    throw error;
  }
};
