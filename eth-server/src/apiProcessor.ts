import axios from 'axios';

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3001/api/events';
const API_KEY = process.env.API_KEY || '';

export async function sendDepositEvent(event: any) {
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await axios.post(API_ENDPOINT, event, { headers });
    
    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to send deposit event via API:', error);
    throw error;
  }
}

export async function connectAPI() {
  // Validate API connection
  try {
    const headers: any = {};
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    const response = await axios.get(API_ENDPOINT, { headers });
    if (response.status === 200) {
      console.log('Successfully connected to API endpoint');
    }
  } catch (error) {
    console.error('Failed to connect to API endpoint:', error);
    throw error;
  }
} 