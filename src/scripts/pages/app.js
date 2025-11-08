import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute(); // contoh hasil: '/reports/123'
    let page = routes[url];

    // Jika rute tidak cocok secara langsung, cek apakah itu rute dinamis
    if (!page) {
      const matchedRouteKey = Object.keys(routes).find((routeKey) => {
        if (routeKey.includes(':')) {
          // Contoh routeKey = '/reports/:id'
          const baseRoute = routeKey.split('/:')[0];
          return url.startsWith(baseRoute);
        }
        return false;
      });

      if (matchedRouteKey) {
        page = routes[matchedRouteKey];
      }
    }

    // Render halaman
    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;