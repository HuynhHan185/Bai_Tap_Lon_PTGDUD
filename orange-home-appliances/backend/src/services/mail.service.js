require('dotenv').config();
const pool = require('./config/db');
const asyncHandler = require('./utils/asyncHandler');
const nodemailer = require('nodemailer');

let transporter = null;

// Lazy init transporter (only when actually sending email)
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = asyncHandler(async ({ to, subject, html }) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"CamVang Home" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't throw - email failure shouldn't break the main flow
  }
});

const sendOrderConfirmation = async (order, email) => {
  const items = order.items || [];
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd">${item.ten_sp}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.so_luong}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${Number(item.don_gia).toLocaleString('vi-VN')}đ</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${Number(item.thanh_tien).toLocaleString('vi-VN')}đ</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#ff6b00">CamVang Home - Xác nhận đơn hàng</h2>
      <p>Cảm ơn bạn đã đặt hàng! Mã đơn hàng của bạn: <strong>${order.ma_don_hang}</strong></p>
      <p><strong>Người nhận:</strong> ${order.ho_ten}</p>
      <p><strong>Địa chỉ:</strong> ${order.dia_chi}</p>
      <p><strong>Điện thoại:</strong> ${order.so_dien_thoai}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;border:1px solid #ddd;text-align:left">Sản phẩm</th>
            <th style="padding:8px;border:1px solid #ddd">SL</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right">Đơn giá</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="margin-top:16px"><strong>Tổng tiền:</strong> ${Number(order.tong_tien).toLocaleString('vi-VN')}đ</p>
      ${order.giam_gia > 0 ? `<p><strong>Giảm giá:</strong> -${Number(order.giam_gia).toLocaleString('vi-VN')}đ</p>` : ''}
      <p><strong>Phí vận chuyển:</strong> ${Number(order.phi_van_chuyen).toLocaleString('vi-VN')}đ</p>
      <h3 style="color:#ff6b00">Thanh toán: ${Number(order.thanh_tien).toLocaleString('vi-VN')}đ</h3>
      <p>Chúng tôi sẽ giao hàng trong 2-5 ngày làm việc.</p>
      <p style="color:#666;font-size:12px">CamVang Home - Đồ gia dụng chất lượng cao</p>
    </div>
  `;

  await sendEmail({ to: email, subject: `Xác nhận đơn hàng ${order.ma_don_hang}`, html });
};

const sendContactReply = async (contact, replyContent) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#ff6b00">CamVang Home - Phản hồi liên hệ</h2>
      <p>Xin chào <strong>${contact.ho_ten}</strong>,</p>
      <p>Cảm ơn bạn đã liên hệ với chúng tôi. Dưới đây là phản hồi:</p>
      <div style="background:#f9f9f9;padding:16px;border-left:4px solid #ff6b00;margin:16px 0">
        ${replyContent}
      </div>
      <p>Nếu cần thêm hỗ trợ, vui lòng reply email này.</p>
      <p style="color:#666;font-size:12px">CamVang Home</p>
    </div>
  `;

  await sendEmail({ to: contact.email, subject: 'Phản hồi liên hệ từ CamVang Home', html });
};

const sendResetPasswordEmail = async (email, resetLink) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#ff6b00">CamVang Home - Đặt lại mật khẩu</h2>
      <p>Bạn yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để đặt lại:</p>
      <a href="${resetLink}" style="display:inline-block;background:#ff6b00;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">
        Đặt lại mật khẩu
      </a>
      <p>Link có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu đặt lại, hãy bỏ qua email này.</p>
      <p style="color:#666;font-size:12px">CamVang Home</p>
    </div>
  `;

  await sendEmail({ to: email, subject: 'Đặt lại mật khẩu CamVang Home', html });
};

module.exports = { sendEmail, sendOrderConfirmation, sendContactReply, sendResetPasswordEmail };
