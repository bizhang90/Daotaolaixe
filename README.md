# ĐÀO TẠO LÁI XE – BÁO CÁO MARKETING

Web app nội bộ ghi nhận và tổng hợp công việc của đội Marketing gồm 3 Media, 2 Talent và 2 IT.

## Nguyên tắc vận hành

- Media và Talent tự nghiên cứu chủ đề, tự nhập nội dung đã tìm được.
- Sản phẩm thực hiện được ghi nhận bằng link đầu ra thực tế.
- IT-01 nhập Ads, lead và hồ sơ theo sản phẩm.
- IT-02 theo dõi dữ liệu và báo cáo tổng hợp.
- Admin xem KPI, duyệt công việc khác và xuất báo cáo.

## 8 menu chính

1. Tổng quan
2. Báo cáo hôm nay
3. Nội dung nghiên cứu
4. Sản phẩm thực hiện
5. Ads & Kết quả
6. Công việc khác
7. Thành viên & KPI
8. Báo cáo tổng hợp

## Chạy thử ngay

Mở `index.html` hoặc chạy local server:

```bash
python3 -m http.server 8080
```

Mở `http://localhost:8080`.

### Tài khoản demo

- ADMIN, MEDIA-01, MEDIA-02, MEDIA-03, TALENT-01, TALENT-02, IT-01, IT-02
- Mật khẩu chung: `123456`

Ở chế độ demo, dữ liệu lưu trên trình duyệt bằng localStorage.

## Vận hành online

1. Tạo Supabase project.
2. Chạy file `supabase/schema.sql`.
3. Tạo tài khoản Auth cho Admin và 7 thành viên.
4. Thêm hồ sơ nhân sự bằng khối SQL mẫu cuối file schema.
5. Đổi `config.js` sang chế độ Supabase theo `config.example.js`.
6. Đưa source lên GitHub và deploy bằng Vercel.

## Quyền sử dụng

- Admin: toàn bộ dashboard, KPI, duyệt công việc khác, xuất báo cáo.
- Media/Talent: nhập báo cáo, chủ đề, sản phẩm; xem kết quả nội dung mình tham gia.
- IT-01: nhập Ads & Kết quả; xem thống kê.
- IT-02: xem tổng hợp và báo cáo.

## Bảo mật

Không đặt Supabase `service_role key` trong `config.js`. Frontend chỉ dùng `anon public key` và quyền dữ liệu được kiểm soát bằng RLS trong schema SQL.
