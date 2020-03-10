import LoginPage from '../pages/login.f7.html';
import DashboardPage from '../pages/dashboard.f7.html';
import CODPage from '../pages/cod.f7.html';

import NotFoundPage from '../pages/404.f7.html';

var routes = [
  {
    path: '/',
    component: DashboardPage,
  },
  {
    path: '/cod',
    component: CODPage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;