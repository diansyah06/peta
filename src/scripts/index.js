import '../styles/styles.css';
import App from './pages/app';
import mapLogo from '../public/images/map.png';
import { getAccessToken } from './utils/auth'; // Impor getAccessToken
import { registerServiceWorker } from './utils';
// Hapus impor 'registerHelperSW' yang ganda
// import { registerServiceWorker as registerHelperSW } from './utils'; 

let deferredPrompt = null;

// Inisialisasi App di scope atas
const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});

/**
 * Fungsi navigasi utama.
 * Mengandung logika transisi DAN logika penjaga (guard).
 */
const handleNavigation = async () => {
  const token = getAccessToken();
  let path = window.location.hash;

  // Normalisasi path jika kosong
  if (path === '') path = '#/';

  // === LOGIKA PENJAGA (GUARD CLAUSE) ===
  const protectedRoutes = ['#/home', '#/favorites', '#/add-report', '#/reports/:id'];
  const authRoutes = ['#/login', '#/register'];
  const rootPath = '#/';

  // Tentukan rute yang dituju (menghandle rute dinamis seperti /reports/:id)
  const targetRoute = path.startsWith('#/reports/') ? '#/reports/:id' : path;

  if (token) {
    // --- KASUS: PENGGUNA SUDAH LOGIN ---
    if (authRoutes.includes(targetRoute)) {
      // 1. Jika sudah login tapi mencoba ke /login atau /register
      window.location.hash = '#/home'; // Paksa ke beranda
      return; // Hentikan eksekusi, hashchange akan memicu fungsi ini lagi
    }
    if (targetRoute === rootPath) {
      // 2. Jika sudah login dan mengklik logo (ke root '#/')
      window.location.hash = '#/home'; // Arahkan ke beranda
      return; // Hentikan eksekusi
    }
  } else {
    // --- KASUS: PENGGUNA BELUM LOGIN ---
    // 3. Jika belum login dan mencoba ke rute yang dilindungi
    if (protectedRoutes.includes(targetRoute) || targetRoute === rootPath) {
      window.location.hash = '#/login'; // Paksa ke login
      return; // Hentikan eksekusi
    }
  }
  // === AKHIR LOGIKA PENJAGA ===
  // Catatan: Jika pengguna belum login dan tujuannya adalah #/login atau #/register,
  // mereka akan lolos dari penjaga dan merender halaman tersebut. Ini sudah benar.


  // Jika lolos semua penjaga, lanjutkan render halaman
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    mainContent.classList.remove('fade-in');
    mainContent.classList.add('fade-out');
    await new Promise((r) => setTimeout(r, 400));
  }

  await app.renderPage(); // 'renderPage' akan merender hash yang valid

  if (mainContent) {
    mainContent.classList.remove('fade-out');
    mainContent.classList.add('fade-in');
  }
};


// === EVENT LISTENER UTAMA ===
document.addEventListener('DOMContentLoaded', async () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.src = mapLogo;
  
  // handle beforeinstallprompt for PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (!document.getElementById('install-btn')) {
      const installBtn = document.createElement('button');
      installBtn.id = 'install-btn';
      installBtn.textContent = 'Install App';
      installBtn.className = 'add-report-btn';
      installBtn.style.position = 'fixed';
      installBtn.style.right = '18px';
      installBtn.style.bottom = '18px';
      document.body.appendChild(installBtn);

      installBtn.addEventListener('click', async () => {
        installBtn.remove();
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        console.log('User choice for install:', choice.outcome);
      });
    }
  });

  // Daftarkan Service Worker
  try {
    if (typeof registerServiceWorker === 'function') {
      await registerServiceWorker();
    }
  } catch (e) {
    console.warn('Gagal mendaftarkan Service Worker:', e);
  }

  // Panggil handleNavigation saat pertama kali memuat halaman
  await handleNavigation();

  // Tambahkan listener HANYA untuk handleNavigation
  window.addEventListener('hashchange', handleNavigation);

  // Hapus listener ganda yang mungkin masih ada di kode Anda
  // window.addEventListener('hashchange', async () => {
  //   await app.renderPage();
  // });
});