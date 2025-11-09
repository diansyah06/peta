import { getAccessToken } from '../../utils/auth';
 
export default class ReportDetailPresenter {
  #view;
  #model;
 
  constructor({ container }) {
    this.#view = {
      container,
      showLoading() {
        this.container.innerHTML = '<p>Memuat detail laporan...</p>';
      },
      showNotFound() {
        this.container.innerHTML = '<p>Laporan tidak ditemukan.</p>';
      },
      renderDetail(report) {
        this.container.innerHTML = `
          <h3>${report.name}</h3>
          <img src="${report.photoUrl}" alt="${report.name}" style="max-width:300px;border-radius:8px;margin-bottom:10px;" />
          <p><b>Tanggal:</b> ${new Date(report.createdAt).toLocaleString('id-ID')}</p>
          <p><b>Deskripsi:</b> ${report.description || 'Tidak ada deskripsi'}</p>
          <h3>Lokasi Kejadian:</h3>
          <div id="map" style="height:400px; border-radius:10px; margin-top:10px;"></div>
        `;
      },
      renderMap(report) {
        const oldMap = document.querySelector('.leaflet-container');
        if (oldMap) oldMap.remove();
 
        const lat = report.lat || -6.2;
        const lng = report.lon || 106.8;
 
        const map = L.map('map').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
 
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<b>${report.name}</b><br>${report.description || 'Tidak ada deskripsi'}`).openPopup();
      },
    };
 
    this.#model = {
      async getReportById(id) {
        try {
          const token = getAccessToken();
          if (!token) throw new Error('Token tidak ditemukan');
 
          const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
 
          if (!response.ok) throw new Error('Gagal mengambil data');
          const data = await response.json();
          return data.story;
        } catch (error) {
          console.error('Error fetching report detail:', error);
          return null;
        }
      },
    };
  }
 
  async init() {
    this.#view.showLoading();
    const id = window.location.hash.split('/')[2];
    const report = await this.#model.getReportById(id);
 
    if (!report) {
      this.#view.showNotFound();
      return;
    }
 
    this.#view.renderDetail(report);
    this.#view.renderMap(report);
  }
}