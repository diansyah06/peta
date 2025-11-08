import Swal from 'sweetalert2';
import { VAPID_PUBLIC_KEY } from '../config';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isNotificationAvailable() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    await Swal.fire({
      icon: 'error',
      title: 'Notifikasi Tidak Didukung',
      text: 'Browser kamu tidak mendukung Notification API.',
    });
    return false;
  }

  const status = await Notification.requestPermission();
  if (status === 'denied') {
    await Swal.fire({
      icon: 'warning',
      title: 'Izin Ditolak',
      text: 'Kamu menolak izin notifikasi.',
    });
    return false;
  }
  if (status === 'default') {
    await Swal.fire({
      icon: 'info',
      title: 'Izin Ditutup',
      text: 'Kamu menutup dialog izin tanpa memilih.',
    });
    return false;
  }

  return status === 'granted';
}

export async function subscribeForPush() {
  if (!isNotificationAvailable()) {
    await Swal.fire({
      icon: 'error',
      title: 'Notifikasi Tidak Didukung',
      text: 'Pastikan browser mendukung Service Worker dan PushManager.',
    });
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    localStorage.setItem('pushSubscription', JSON.stringify(subscription));
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil Subscribe!',
      text: 'Kamu akan menerima notifikasi laporan baru.',
      timer: 1500,
      showConfirmButton: false,
    });
    return subscription;
  } catch (err) {
    console.error('subscribe error', err);
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Subscribe',
      text: err.message,
    });
    return null;
  }
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    await Swal.fire({
      icon: 'info',
      title: 'Belum Subscribe',
      text: 'Kamu belum berlangganan notifikasi.',
    });
    return;
  }
  try {
    await subscription.unsubscribe();
    localStorage.removeItem('pushSubscription');
    await Swal.fire({
      icon: 'success',
      title: 'Unsubscribe Berhasil',
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error('unsubscribe error', err);
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Unsubscribe',
      text: err.message,
    });
  }
}