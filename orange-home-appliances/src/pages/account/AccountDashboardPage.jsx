function AccountDashboardPage() {
    return (
      <section className="container account-dashboard">
        <aside className="account-sidebar">
          <a href="#">Thông tin cá nhân</a>
          <a href="#">Đơn hàng</a>
          <a href="#">Sổ địa chỉ</a>
        </aside>
  
        <div className="account-content">
          <h1>Tài khoản của tôi</h1>
          <p>
            Đây là dashboard MVP. Khi nối backend thật, bạn có thể thêm lịch sử
            đơn hàng, cập nhật hồ sơ và quản lý địa chỉ.
          </p>
        </div>
      </section>
    )
  }
  
  export default AccountDashboardPage