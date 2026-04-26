import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  return (
    <section className="auth-page">
      <Helmet>
        <title>
          {isLogin
            ? 'Đăng nhập'
            : isRegister
              ? 'Đăng ký'
              : 'Quên mật khẩu'}{' '}
          | CamVang Home
        </title>
      </Helmet>

      <div className="auth-card">
        <h1>
          {isLogin
            ? 'Đăng nhập'
            : isRegister
              ? 'Đăng ký'
              : 'Quên mật khẩu'}
        </h1>

        {!isForgot && <button className="oauth-btn">Tiếp tục với Google</button>}

        <form>
          <label>
            Email
            <input type="email" />
          </label>

          {!isForgot && (
            <label>
              Mật khẩu
              <input type="password" />
            </label>
          )}

          {isRegister && (
            <label>
              Nhập lại mật khẩu
              <input type="password" />
            </label>
          )}

          <button className="btn-primary">
            {isLogin
              ? 'Đăng nhập'
              : isRegister
                ? 'Tạo tài khoản'
                : 'Gửi link đặt lại'}
          </button>
        </form>

        {isLogin && <Link to="/tai-khoan/quen-mat-khau">Quên mật khẩu?</Link>}
        {isLogin && <Link to="/tai-khoan/dang-ky">Chưa có tài khoản?</Link>}
        {isRegister && <Link to="/tai-khoan/dang-nhap">Đã có tài khoản?</Link>}
      </div>
    </section>
  )
}

export default AuthPage