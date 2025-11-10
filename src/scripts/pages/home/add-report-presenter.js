import Swal from 'sweetalert2';
import { getAccessToken } from '../../utils/auth';

export default class AddReportPresenter {
  #model;
  #map;
  #capturedImageBlob = null;
  #view = {};

  constructor({ model }) {
    this.#model = model;
  }

  initMap() {
    this.#map = L.map('map').setView([3.5952, 98.6722], 13); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.#map);
  }

  async handleSearchLocation(query) {
    if (!query) return;

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const results = await response.json();

    if (results.length > 0) {
      const { lat, lon } = results[0];
      this.#map.setView([lat, lon], 14);
      L.marker([lat, lon]).addTo(this.#map).bindPopup(query).openPopup();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Lokasi Tidak Ditemukan',
        text: 'Coba ketik nama lokasi lain yang lebih spesifik.',
      });
    }
  }

  // ==== KAMERA ====
  initCamera({ videoElement, photoPreview, openBtn, captureBtn, closeBtn }) {
    this.#view = { videoElement, photoPreview, openBtn, captureBtn, closeBtn };
    let stream = null;

    // Buka kamera
    openBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        captureBtn.disabled = false;
        closeBtn.style.display = 'inline-block';
        openBtn.disabled = true;
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Kamera Tidak Dapat Diakses',
          text: err.message,
        });
      }
    });

    // Ambil foto dari stream
    captureBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        this.#capturedImageBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        photoPreview.src = imageUrl;
        photoPreview.style.display = 'block';

        Swal.fire({
          icon: 'success',
          title: 'Foto Berhasil Diambil!',
          text: 'Kamu bisa langsung mengirim laporan sekarang.',
          timer: 2000,
          showConfirmButton: false,
        });
      }, 'image/jpeg');
    });

    // Tutup kamera
    closeBtn.addEventListener('click', () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      videoElement.style.display = 'none';
      captureBtn.disabled = true;
      closeBtn.style.display = 'none';
      openBtn.disabled = false;

      Swal.fire({
        icon: 'info',
        title: 'Kamera Ditutup',
        text: 'Kamera telah dinonaktifkan.',
        timer: 1500,
        showConfirmButton: false,
      });
    });
  }

  getCapturedImage() {
    return this.#capturedImageBlob;
  }

  async handleSubmitReport(data) {
    if (!data.title || !data.severity || !data.imageInput) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Lengkapi semua data sebelum mengirim laporan.',
      });
      return;
    }

    const latlng = this.#map.getCenter();
    const description = data.description || 'Tidak ada deskripsi';
    const postDescription = `[${data.title.toUpperCase()} - ${data.severity.toUpperCase()}] ${description}`;

    // Spinner loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = 0;
    loadingOverlay.style.left = 0;
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.flexDirection = 'column';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.color = '#fff';
    loadingOverlay.style.fontSize = '1.2em';
    loadingOverlay.style.zIndex = 9999;
    loadingOverlay.innerHTML = `
      <div class="spinner" style="
        width: 50px; height: 50px;
        border: 5px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <p style="margin-top:15px;">Mengirim laporan...</p>
    `;
    document.body.appendChild(loadingOverlay);

    const style = document.createElement('style');
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);

    try {
      const response = await this.#model.postStory({
        description: postDescription,
        photo: data.imageInput,
        lat: latlng.lat,
        lon: latlng.lng,
      });

      loadingOverlay.remove();

      if (!response.error) {
        await Swal.fire({
          icon: 'success',
          title: 'Laporan Berhasil!',
          text: 'Laporanmu sudah terkirim ke server.',
          confirmButtonText: 'OK',
        });
        window.location.hash = '#/home';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengirim Laporan',
          text: response.message || 'Terjadi kesalahan pada server.',
        });
      }
    } catch (err) {
      console.error(err);
      loadingOverlay.remove();
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan!',
        text: 'Terjadi kesalahan saat mengirim laporan.',
      });
    }
  }
}