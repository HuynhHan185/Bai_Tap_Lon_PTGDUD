import { Helmet } from 'react-helmet-async'

function AboutPage() {
  return (
    <section className="container article-page">
      <Helmet>
        <title>Giới thiệu | CamVang Home</title>
      </Helmet>

      <h1>Về CamVang Home</h1>

      <p>
        CamVang Home là cửa hàng đồ điện gia dụng tập trung vào trải nghiệm mua
        dễ, giá rõ ràng, hậu mãi dễ hiểu và nhóm sản phẩm phù hợp gia đình Việt.
      </p>

      <div className="value-grid">
        <article>
          <h2>Hàng chính hãng</h2>
          <p>Nguồn hàng minh bạch, có bảo hành.</p>
        </article>

        <article>
          <h2>Giá niêm yết rõ</h2>
          <p>Không dùng giá mồi, không ẩn phí.</p>
        </article>

        <article>
          <h2>Giao nhanh</h2>
          <p>Ưu tiên khu vực nội thành và tỉnh thành lớn.</p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage