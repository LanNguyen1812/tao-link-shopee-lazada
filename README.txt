Tạo link Shopee - Lazada (web tĩnh)
====================================

Mô tả:
- Web tĩnh (HTML + JS) cho phép dán link sản phẩm Shopee hoặc Lazada,
  hệ thống sẽ tự động thêm Affiliate ID tương ứng.

Cấu hình sẵn:
- Shopee ID: 17351700112
- Lazada ID: 218701259

Các file:
- index.html  --> giao diện chính
- style.css   --> style trang (xanh nhạt)
- script.js   --> logic phát hiện sàn và thêm affiliate param
- README.txt  --> file này

Hướng dẫn sử dụng:
1) Giải nén thư mục.
2) Upload toàn bộ nội dung vào repository GitHub mới hoặc lên Netlify/Vercel.
   - Trên GitHub: tạo repo public, bấm "Upload files" và commit.
   - Trên Vercel: Add New Project -> Import Git Repository -> Chọn repo -> Deploy.
3) Truy cập trang, dán link sản phẩm Shopee/Lazada, nhấn "Tạo Link Ngay".

Lưu ý:
- Một số link rút gọn (shp.ee, lzd.co) có thể yêu cầu mở rộng để tracking chính xác.
- Parameter chính xác cho từng nền tảng có thể khác nhau. Hiện đang dùng:
  - Shopee: af_id
  - Lazada: aff_id
  Nếu cần đổi param, chỉnh file script.js -> CONFIG.

