import HomePresenter from './home-presenter';
import * as CityCareAPI from '../../data/api';
import * as AuthModel from '../../utils/auth';
import { showFormattedDate } from '../../utils/index';

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <section class="container" id="main-content">
        <button id="addReportBtn" class="add-report-btn">+ Tambah Laporan</button>
        <p>Klik marker atau area di peta untuk melihat info lokasi.</p>

        <div id="map" class="map" style="height: 500px; margin-top: 10px;"></div>

        <h2 style="margin-top:20px">Daftar Laporan</h2>
        
        <div class="search-container" style="margin-bottom: 15px;">
        <label>Cari Laporan</label>
          <input type="search" id="searchBar" alt="cari"
          placeholder="Cari laporan berdasarkan nama atau deskripsi..." 
                 style="width: 100%; padding: 10px 14px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px;">
        </div>
        <div id="reportList"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: CityCareAPI,
      authModel: AuthModel,
      utils: { showFormattedDate },
    });

    await this.#presenter.init();

    // Aksesibilitas: Fokus otomatis ke konten utama
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.focus();
  }

  showAuthError() {
    import('sweetalert2').then(({ default: Swal }) => {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Ditolak',
        text: 'Anda harus login untuk mengakses halaman utama.',
      }).then(() => {
        window.location.hash = '#/login';
      });
    });
  }

  showLogoutButton(isVisible) {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.style.display = isVisible ? 'block' : 'none';
      if (isVisible) {
        logoutButton.onclick = (e) => {
          e.preventDefault();
          import('sweetalert2').then(({ default: Swal }) => {
            Swal.fire({
              title: 'Yakin ingin logout?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Ya, logout',
              cancelButtonText: 'Batal',
            }).then((result) => {
              if (result.isConfirmed) {
                this.#presenter.handleLogout();
              }
            });
          });
        };
      }
    }
  }

  renderMap() {
    const map = L.map('map').setView([-2.5489, 118.0148], 5);
    const baseMaps = {
      "Peta Biasa": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }),
      "Peta Satelit": L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri World Imagery' }
      ),
    };
    baseMaps["Peta Biasa"].addTo(map);
    L.control.layers(baseMaps).addTo(map);
    return map;
  }

  renderCityMarkers(map) {
    const cities = [
      { name: 'Medan', coords: [3.5952, 98.6722], info: 'Ibu kota Sumatera Utara' },
      { name: 'Jakarta', coords: [-6.2088, 106.8456], info: 'Ibu kota Indonesia' },
      { name: 'Surabaya', coords: [-7.2575, 112.7521], info: 'Kota Pahlawan di Jawa Timur' },
      { name: 'Makassar', coords: [-5.1477, 119.4327], info: 'Pintu gerbang Indonesia Timur' },
    ];

    cities.forEach((city) => {
      L.marker(city.coords).addTo(map).bindPopup(`<b>${city.name}</b><br>${city.info}`);
    });
  }

  renderClickPopup(map) {
    const popup = L.popup();
    map.on('click', (e) => {
      popup
        .setLatLng(e.latlng)
        .setContent(`Koordinat: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`)
        .openOn(map);
    });
  }

  renderStories(map, stories, favoriteStoryIds = new Set()) {
    const reportList = document.getElementById('reportList');

    if (!stories || stories.length === 0) {
      reportList.innerHTML = '<p>Tidak ada laporan ditemukan.</p>';
      return;
    }

    reportList.innerHTML = stories
      .slice(0, 20)
      .map((s) => {
        const isLiked = favoriteStoryIds.has(s.id); 
        const likeButtonColor = isLiked ? '#dc3545' : '#aaaaaa'; 

        return `
          <div class="report-card" style="view-transition-name: card-${s.id};">
            <div class="report-card-content">
              <h3>${s.name}</h3>
              <p><b>ID:</b> ${s.id}</p>
              <img src="${s.photoUrl}" alt="${s.name}" />
              <p class="story-date">Tanggal: ${this.#presenter.formatDate(s.createdAt)}</p>
              <p>${s.description || 'Tidak ada deskripsi'}</p>
              
              <div class="report-card-buttons" style="display: flex; gap: 8px; margin-top: 8px; align-items: center;">
                <button class="btn-detail" data-id="${s.id}" style="
                  background-color: #007bff;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  padding: 6px 12px;
                  cursor: pointer;
                  flex-grow: 1;
                ">Selengkapnya</button>
                
                <button 
                  class="btn-like" 
                  data-id="${s.id}" 
                  aria-label="${isLiked ? 'Unlike this story' : 'Like this story'}"
                  style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 5px;
                    font-size: 1.5rem;
                    color: ${likeButtonColor};
                ">
                  ♥
                </button>
              </div>
              
            </div>
          </div>
        `;
      })
      .join('');

    const style = document.createElement('style');
    style.textContent = `
    #reportList {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 1rem;
    }

    .report-card {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 12px;
      transition: transform 0.2s ease;
    }

    .report-card:hover {
      transform: scale(1.02);
    }

    .report-card img {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .btn-detail:hover {
      background-color: #0056b3;
    }
  `;
    document.head.appendChild(style);

    stories.slice(0, 10).forEach((story) => {
      const lat = -6.2 + Math.random();
      const lng = 106.8 + Math.random();
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${story.name}</b><br>${story.description || 'Tidak ada deskripsi'}`);
    });

    // 🎯 Event listener tombol "Selengkapnya"
    const buttons = document.querySelectorAll('.btn-detail');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        console.log('🆔 ID yang diklik:', id);

        // Transisi SPA
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = `#/reports/${id}`;
          });
        } else {
          window.location.hash = `#/reports/${id}`;
        }
      });
    });


  }
  setupLikeButtonListener(handler) {
    const reportList = document.getElementById('reportList');
    reportList.addEventListener('click', async (event) => {
      const likeButton = event.target.closest('.btn-like');
      if (!likeButton) return;

      const id = likeButton.dataset.id;
      const isCurrentlyLiked = likeButton.style.color.includes('rgb(220, 53, 69)'); 

      // Tampilkan loading
      likeButton.disabled = true;
      likeButton.innerHTML = '<i class="loader-button" style="border-top-color: #333; width: 1em; height: 1em;"></i>';

      try {
        const newLikedStatus = await handler(id);

        // Update UI tombol
        if (newLikedStatus) {
          likeButton.style.color = '#dc3545'; 
          likeButton.setAttribute('aria-label', 'Unlike this story');
        } else {
          likeButton.style.color = '#aaaaaa';
          likeButton.setAttribute('aria-label', 'Like this story');
        }
      } catch (error) {
        // Jika gagal, kembalikan ke state semula
        likeButton.style.color = isCurrentlyLiked ? '#dc3545' : '#aaaaaa';
      } finally {
        // Kembalikan ikon hati dan aktifkan tombol
        likeButton.disabled = false;
        likeButton.innerHTML = '♥';
      }
    });
  }


  renderLocalReports(map, reports) {
    const reportList = document.getElementById('reportList');
    if (reports.length > 0) {
      reports.forEach((r) => {
        reportList.innerHTML += `
          <div class="
          " style="border: 1px solid #ddd; margin: 10px; padding: 10px;">
            <h3>${r.title}</h3>
            <img src="${r.image}" width="200" alt="${r.title}"/>
            <p>${r.description}</p>
            <button class="detail-btn" data-id="${r.id}">Selengkapnya</button>
          </div>
        `;
        L.marker([r.lat, r.lng]).addTo(map).bindPopup(r.title);
      });
    } else {
      reportList.innerHTML += `<p>Belum ada laporan yang ditambahkan.</p>`;
    }
  }

  setupNavigation() {
    const navigateWithTransition = (url) => {
      if (!document.startViewTransition) {
        window.location.hash = url;
        return;
      }
      document.startViewTransition(() => {
        window.location.hash = url;
      });
    };

    document.getElementById('addReportBtn').addEventListener('click', () => {
      navigateWithTransition('#/add-report');
    });

    document.querySelectorAll('.detail-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        navigateWithTransition(`#/reports/${id}`);
      });
    });
  }
}
