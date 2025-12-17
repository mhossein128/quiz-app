'use client';

import axios from 'axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ username, password }) => {
  try {
    const res = await axios.post('/api/auth/login', { username, password });

    const { token, user } = res.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    setSession(token);

    return { user };
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error.response?.data?.error || error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ username, password }) => {
  try {
    const res = await axios.post('/api/auth/register', { username, password });

    const { user } = res.data;

    // After registration, automatically sign in
    const loginRes = await axios.post('/api/auth/login', { username, password });
    const { token } = loginRes.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, token);

    return { user };
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error.response?.data?.error || error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
