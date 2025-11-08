import ReportDetailPresenter from '../home/report-detail-presenter';

export default class ReportDetailPage {
  async render() {
    return `
      <section class="container" id="detailContainer">
        <p>Memuat detail laporan...</p>
      </section>
    `;
  }

  async afterRender() {
    const container = document.getElementById('detailContainer');
    this.presenter = new ReportDetailPresenter({ container });
    this.presenter.init();
  }
}