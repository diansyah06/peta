import HomePage from '../pages/home/home-page';
import AddReportPage from '../pages/home/add-report-page';
import ReportDetailPage from '../pages/home/report-detail-page';
import FavoritesPage from '../pages/favorites-page';

import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';

const routes = {
  '/': new HomePage(), 
  '/home': new HomePage(),
  '/add-report': new AddReportPage(),
  '/reports/:id': new ReportDetailPage(),
  '/favorites': new FavoritesPage(),
  
  // Rute Auth
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;