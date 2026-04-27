import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'

import { login, register } from '../../services/api'
import { setUser } from '../../features/user/userSlice'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(3, 'Mật khẩu phải có ít nhất 3 ký tự'),
})

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nhập họ tên đầy đủ'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(3, 'Mật khẩu phải có ít nhất 3 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
})

function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const schema = isRegister ? registerSchema : loginSchema

  const {
    register: formRegister,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values) {
    try {
      let data
      if (isLogin) {
        data = await login(values.email, values.password)
      } else if (isRegister) {
        data = await register({
          email: values.email,
          password: values.password,
          fullName: values.fullName
        })
      }
      
      if (data) {
        dispatch(setUser(data))
        navigate('/tai-khoan')
      }
    } catch (error) {
      setError('root', { message: error.message || 'Có lỗi xảy ra' })
    }
  }

  return (
    <section className="auth-page container" style={{ maxWidth: '400px', marginTop: '40px' }}>
      <Helmet>
        <title>
          {isLogin ? 'Đăng nhập' : isRegister ? 'Đăng ký' : 'Quên mật khẩu'} | CamVang Home
        </title>
      </Helmet>

      <div className="auth-card" style={{ padding: '30px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>
          {isLogin ? 'Đăng nhập' : isRegister ? 'Đăng ký' : 'Quên mật khẩu'}
        </h1>

        {errors.root && (
          <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', marginBottom: '16px', borderRadius: '4px' }}>
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isRegister && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 'bold' }}>
              Họ và tên
              <input type="text" {...formRegister('fullName')} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 'normal' }} />
              {errors.fullName && <small style={{ color: 'red', fontWeight: 'normal' }}>{errors.fullName.message}</small>}
            </label>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 'bold' }}>
            Email
            <input type="email" {...formRegister('email')} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 'normal' }} />
            {errors.email && <small style={{ color: 'red', fontWeight: 'normal' }}>{errors.email.message}</small>}
          </label>

          {!isForgot && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 'bold' }}>
              Mật khẩu
              <input type="password" {...formRegister('password')} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 'normal' }} />
              {errors.password && <small style={{ color: 'red', fontWeight: 'normal' }}>{errors.password.message}</small>}
            </label>
          )}

          {isRegister && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 'bold' }}>
              Nhập lại mật khẩu
              <input type="password" {...formRegister('confirmPassword')} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 'normal' }} />
              {errors.confirmPassword && <small style={{ color: 'red', fontWeight: 'normal' }}>{errors.confirmPassword.message}</small>}
            </label>
          )}

          <button className="btn-primary" type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
            {isSubmitting ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : isRegister ? 'Tạo tài khoản' : 'Gửi link đặt lại'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', textAlign: 'center' }}>
          {isLogin && <Link to="/tai-khoan/quen-mat-khau" style={{ color: '#2563eb' }}>Quên mật khẩu?</Link>}
          {isLogin && <Link to="/tai-khoan/dang-ky" style={{ color: '#2563eb' }}>Chưa có tài khoản? Đăng ký ngay</Link>}
          {isRegister && <Link to="/tai-khoan/dang-nhap" style={{ color: '#2563eb' }}>Đã có tài khoản? Đăng nhập</Link>}
        </div>
      </div>
    </section>
  )
}

export default AuthPage