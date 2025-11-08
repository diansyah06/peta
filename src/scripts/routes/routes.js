import HomePage from '../pages/home/home-page';
import AddReportPage from '../pages/home/add-report-page';
import ReportDetailPage from '../pages/home/report-detail-page';
// Impor halaman favorit baru
import FavoritesPage from '../pages/favorites-page';

// Halaman Auth
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';

const routes = {
  // Ubah rute default ke Login
  '/': new HomePage(), 
  '/home': new HomePage(),
  '/add-report': new AddReportPage(),
  '/reports/:id': new ReportDetailPage(),
  // Tambahkan rute favorit baru
  '/favorites': new FavoritesPage(),
  
  // Rute Auth
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;