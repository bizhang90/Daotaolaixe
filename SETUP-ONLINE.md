# Thiết lập online: Supabase + Vercel

## 1. Supabase

- Tạo project mới.
- Vào SQL Editor, chạy `supabase/schema.sql`.
- Vào Authentication > Users, tạo 8 tài khoản email/mật khẩu.
- Sao chép UUID từng tài khoản, thay vào khối `insert into public.members` nằm cuối file SQL rồi chạy khối đó.

## 2. Kết nối ứng dụng

Đổi nội dung file `config.js`:

```js
window.APP_CONFIG = {
  mode: 'supabase',
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY'
};
```

Project URL và anon public key nằm trong Supabase Project Settings > API.

## 3. Đưa lên Vercel

- Tạo GitHub repository và upload toàn bộ thư mục app.
- Trong Vercel chọn Add New Project > import repository.
- Framework preset: Other.
- Deploy.

## 4. Nhập tên thật và KPI

- Đăng nhập tài khoản Admin.
- Mở menu `Thành viên & KPI`.
- Chỉnh tên hiển thị, vai trò, trạng thái và KPI mô tả của từng người.

## 5. Quy trình sử dụng hằng ngày

- Media/Talent: nhập chủ đề mới và sản phẩm đã làm; cuối ngày nhập báo cáo.
- IT-01: chọn sản phẩm đã đăng/chạy Ads và nhập kết quả.
- IT-02: xem dữ liệu tổng hợp, hỗ trợ hệ thống/báo cáo.
- Admin: xem dashboard, duyệt công việc khác và xuất báo cáo kỳ.
