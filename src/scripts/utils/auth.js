import { ACCESS_TOKEN_KEY } from '../config';
 
// Simpan token ke localStorage
export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
 
// Ambil token dari localStorage
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
 
// Hapus token dari localStorage (misalnya saat logout)
export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}