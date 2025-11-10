import '../styles/styles.css';
import App from './pages/app';
import mapLogo from '../public/images/map.png';
import { getAccessToken } from './utils/auth'; 
import { registerServiceWorker } from './utils';


let deferredPrompt = null;

// Inisialisasi App di scope atas
const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});


const handleNavigation = async () => {
  const token = getAccessToken();
  let path = window.location.hash;

  
  if (path === '') path = '#/';

  
  const protectedRoutes = ['#/home', '#/favorites', '#/add-report', '#/reports/:id'];
  const authRoutes = ['#/login', '#/register'];
  const rootPath = '#/';
  
  const targetRoute = path.startsWith('#/reports/') ? '#/reports/:id' : path;

  if (token) {
    
    if (authRoutes.includes(targetRoute)) {
      
      window.location.hash = '#/home'; 
      return; 
    }
    if (targetRoute === rootPath) {
      
      window.location.hash = '#/home'; 
      return; 
    }
  } else {
    
    if (protectedRoutes.includes(targetRoute) || targetRoute === rootPath) {
      window.location.hash = '#/login';
      return; 
    }
  }
  
  
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    mainContent.classList.remove('fade-in');
    mainContent.classList.add('fade-out');
    await new Promise((r) => setTimeout(r, 400));
  }

  await app.renderPage(); 

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

 
  window.addEventListener('hashchange', handleNavigation);
});