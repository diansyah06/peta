import { getAllFavorites, deleteFavorite } from '../data/db';
import { showFormattedDate } from '../utils/index';
import Swal from 'sweetalert2';

export default class FavoritesPage {
  async render() {
    return `
      <style>
        #favoriteList {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 1.5rem;
        }
      </style>
      <section class="container" id="main-content-favorites">
        <h5 style="margin-top: 1rem; text-align: center;">Halaman Favorit</h5>
        <p>Laporan yang Anda simpan akan muncul di sini.</p>
        <div id="favoriteList" style="margin-top: 1.5rem;">
          <p>Memuat laporan favorit...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const favoriteListContainer = document.getElementById('favoriteList');
    try {
      const favorites = await getAllFavorites();
      this.renderFavorites(favorites);
    } catch (error) {
      favoriteListContainer.innerHTML = '<p>Gagal memuat laporan favorit.</p>';
    }

    // Tambahkan event listener untuk tombol "unlike" 
    favoriteListContainer.addEventListener('click', async (event) => {
      const unlikeButton = event.target.closest('.btn-unlike');
      if (unlikeButton) {
        const id = unlikeButton.dataset.id;
        
        // Tampilkan konfirmasi
        const result = await Swal.fire({
          title: 'Hapus dari Favorit?',
          text: 'Anda yakin ingin menghapus laporan ini dari favorit?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, Hapus',
          cancelButtonText: 'Batal',
        });
        
        if (result.isConfirmed) {
          try {
            // Tampilkan loading di tombol
            unlikeButton.disabled = true;
            unlikeButton.innerHTML = '<i class="loader-button"></i>';
            
            await deleteFavorite(id);
            
            // Re-render daftar
            const newFavorites = await getAllFavorites();
            this.renderFavorites(newFavorites);
            
            Swal.fire('Dihapus!', 'Laporan telah dihapus dari favorit.', 'success');
          } catch (e) {
            unlikeButton.disabled = false;
            unlikeButton.textContent = 'Hapus';
            Swal.fire('Error', 'Gagal menghapus favorit.', 'error');
          }
        }
      }
    });
  }
  
  // Fungsi untuk merender daftar favorit
  renderFavorites(favorites) {
    const favoriteListContainer = document.getElementById('favoriteList');
    if (!favorites || favorites.length === 0) {
      favoriteListContainer.innerHTML = '<p>Anda belum memiliki laporan favorit.</p>';
      return;
    }

    favoriteListContainer.innerHTML = favorites.map((story) => `
      <div class="report-card" style="margin:50px">
        <div class="report-card-content">
          <h3>${story.name}</h3>
          <img src="${story.photoUrl}" alt="${story.name}" />
          <p class="story-date">Tanggal: ${showFormattedDate(story.createdAt)}</p>
          <p>${story.description || 'Tidak ada deskripsi'}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="btn-detail" data-id="${story.id}">Selengkapnya</button>
            <button 
              class="btn-unlike" 
              data-id="${story.id}" 
              style="background-color: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"
              title="Hapus dari favorit"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}