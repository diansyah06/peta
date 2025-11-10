import AddReportPresenter from './add-report-presenter';
import * as CityCareAPI from '../../data/api';
 
export default class AddReportPage {
  #presenter = null;
 
  async render() {
    return `
      <section class="container">
        <h2>Tambah Laporan</h2>
        <form id="reportForm" style="display:flex; flex-direction:column; gap:10px;">
         
          <div class="form-control">
            <label for="title">Judul Laporan</label>
            <input type="text" id="title" placeholder="Judul" required />
          </div>
         
          <div class="form-control">
            <label for="severity">Tingkat Masalah</label>
            <select id="severity" required>
              <option value="ringan">Ringan</option>
              <option value="sedang">Sedang</option>
              <option value="berat">Berat</option>
            </select>
          </div>
 
          <div class="form-control">
            <label for="description">Keterangan / Detail Laporan</label>
            <textarea id="description" placeholder="Keterangan"></textarea>
          </div>
         
          <div class="form-control">
            <label for="locationInput">Cari lokasi (ketik nama kota):</label>
            <input type="text" id="locationInput" placeholder="Contoh: Medan" />
          </div>
         
          <div id="map" style="height:400px; border-radius:10px;"></div>
 
          <div class="form-control">
            <label>Ambil atau pilih gambar:</label>
           
            <!-- Preview hasil foto -->
            <img id="photoPreview" alt="Preview foto" style="max-width:300px; margin-top:10px; border-radius:8px; display:none;" />
 
            <!-- Kamera Live -->
            <video id="cameraStream" autoplay playsinline style="max-width:300px; border-radius:10px; display:none;"></video>
 
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button type="button" id="openCameraBtn">📷 Buka Kamera</button>
              <button type="button" id="capturePhotoBtn" disabled>📸 Ambil Foto</button>
              <button type="button" id="closeCameraBtn" style="display:none;">❌ Tutup Kamera</button>
            </div>

            <label for="img">Image</label>
            <input type="file" id="imageInput" accept="image/*" style="margin-top:10px;" />
          </div>
 
          <button type="submit" style="margin-top:10px;">Simpan Laporan</button>
        </form>
      </section>
    `;
  }
 
  async afterRender() {
    this.#presenter = new AddReportPresenter({ model: CityCareAPI });
    this.#presenter.initMap();
 
    // Kamera
    this.#presenter.initCamera({
      videoElement: document.getElementById('cameraStream'),
      photoPreview: document.getElementById('photoPreview'),
      openBtn: document.getElementById('openCameraBtn'),
      captureBtn: document.getElementById('capturePhotoBtn'),
      closeBtn: document.getElementById('closeCameraBtn'),
    });
 
    const form = document.getElementById('reportForm');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
 
      const data = {
        title: document.getElementById('title').value,
        severity: document.getElementById('severity').value,
        description: document.getElementById('description').value,
        imageInput: this.#presenter.getCapturedImage() || document.getElementById('imageInput').files[0],
      };
 
      await this.#presenter.handleSubmitReport(data);
    });
 
    const locationInput = document.getElementById('locationInput');
    locationInput.addEventListener('change', async (e) => {
      await this.#presenter.handleSearchLocation(e.target.value);
    });
  }
}