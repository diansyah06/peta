import { getAccessToken } from "../utils/auth";
import CONFIG from '../config';

const BASE_API_URL = 'https://story-api.dicoding.dev/v1';

const ENDPOINTS = {
  STORIES: `${BASE_API_URL}/stories`,
  REGISTER: `${BASE_API_URL}/register`,
  LOGIN: `${BASE_API_URL}/login`,
};

export async function getStories() {
  const token = getAccessToken();
  if (!token) {
    return {
      error: true,
      message: "Token tidak ditemukan. Harap login terlebih dahulu.",
    };
  }

  const response = await fetch(ENDPOINTS.STORIES, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (response.status === 401) {
    return {
      error: true,
      message: "Unauthorized. Token tidak valid atau sudah kedaluwarsa.",
    };
  }
  return data;
}

/**
 * Unggah story baru
 */
export async function postStory({ description, photo, lat, lon }) {
  const token = getAccessToken();
  if (!token) {
    return {
      error: true,
      message: "Token tidak ditemukan. Harap login terlebih dahulu.",
    };
  }

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat && lon) {
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  const response = await fetch(`${BASE_API_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data;
}

/**
 * Ambil detail story by ID
 */
export async function getStoryById(id) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Token tidak ditemukan. Harap login terlebih dahulu.");
  }

  const response = await fetch(`${BASE_API_URL}/stories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal mengambil data.");
  return data.story;
}

/**
 * Register dan Login
 */
export async function getRegistered({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return await response.json();
}

export async function getLogin({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const responseJson = await response.json();

  if (!responseJson.error) {
    return {
      ok: true,
      message: 'Login berhasil!',
      data: { accessToken: responseJson.loginResult.token },
    };
  }

  return {
    ok: false,
    message: responseJson.message,
    data: null,
  };
}

export async function subscribeToPushAPI(subscription) {
  const token = getAccessToken();
  if (!token) {
    return { error: true, message: 'Token tidak ditemukan' };
  }

  // 1. Ubah subscription object ke format JSON standar
  const subscriptionData = subscription.toJSON();

  // 2. HAPUS key 'expirationTime' yang tidak diizinkan oleh server
  delete subscriptionData.expirationTime;

  try {
    const response = await fetch(`${BASE_API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // 3. Kirim data yang sudah bersih
      body: JSON.stringify(subscriptionData),
    });

    return response.json();
  } catch (err) {
    return { error: true, message: err.message };
  }
}

/**
 * [BARU] Hapus data subscription dari API Story
 */
export async function unsubscribeFromPushAPI(subscription) {
  const token = getAccessToken();
  if (!token) {
    return { error: true, message: 'Token tidak ditemukan' };
  }

  try {
    // PERBAIKAN: Endpoint diubah ke /notifications/subscribe
    const response = await fetch(`${BASE_API_URL}/notifications/subscribe`, {
      // PERBAIKAN: Metode diubah ke DELETE
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // PERBAIKAN: Body disesuaikan dengan dokumentasi (hanya endpoint)
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    return response.json();
  } catch (err) {
    return { error: true, message: err.message };
  }
}