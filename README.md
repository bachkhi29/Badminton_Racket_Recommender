# 🏸 Chọn Vợt — Badminton Racket Recommender

🌐 **[Mở web app Chọn Vợt](https://bachkhi29.github.io/Badminton_Racket_Recommender/)** · [Xem thư viện vợt](https://bachkhi29.github.io/Badminton_Racket_Recommender/#thu-vien)

Web app tiếng Việt giúp chọn vợt cầu lông theo ưu tiên tấn công, phản tạt/phòng thủ và ngân sách. Giao diện chạy trực tiếp trên trình duyệt, phù hợp cả điện thoại và máy tính.

## Tính năng

- 50 mẫu vợt thuộc nhiều thương hiệu; tìm kiếm theo tên/phong cách, lọc hãng và mức giá.
- Gợi ý 3 mẫu gần nhất với nhu cầu và giải thích điểm công, thủ của từng mẫu.
- Ngân sách là giới hạn với các mẫu có giá tham khảo. Mẫu chưa xác minh giá được hiển thị riêng, không được coi là nằm trong ngân sách.
- Giá mới lấy từ **VNB Shop ngày 23/09/2026** có đường dẫn tới đúng trang sản phẩm. Các giá còn lại là dữ liệu gốc của dự án, chưa được đối chiếu với VNB. Giá có thể thay đổi theo phiên bản, màu, khuyến mãi và thời điểm.

## Cách chạy

Đây là trang tĩnh, không cần cài thư viện. Tại thư mục gốc:

```bash
python -m http.server 8000
```

Mở `http://localhost:8000`. Không mở trực tiếp `index.html` bằng `file://` vì trình duyệt thường chặn đọc CSV qua `fetch`.

Kiểm tra logic:

```bash
node --test tests/*.test.mjs
```

## Dữ liệu và cách xếp hạng

Nguồn dữ liệu: [data/racket_dataset.csv](data/racket_dataset.csv). `Diem_Cong` và `Diem_Thu` là **điểm quy ước của dự án (1–10)**, không phải thông số do hãng công bố hay phép đo hiệu năng. Điểm khớp = `max(0, round(100 - 12 × khoảng cách Euclid giữa hai cặp điểm))`. Giá vượt ngân sách bị loại khỏi danh sách chính. Khi bằng điểm, vợt có giá thấp hơn xếp trước.

14 tên mẫu mới được đối chiếu với [danh mục Yonex](https://www.yonex.com/badminton/racquets) và [danh mục Victor](https://www.victorsport.com/product/). Sáu mẫu có giá VNB được đối chiếu trực tiếp qua cột `Url_Gia` trong CSV. Các mẫu khác chưa tìm được giá đúng phiên bản tại VNB được để trống.

**Lưu ý:** Đây là công cụ khám phá và so sánh theo dữ liệu chủ quan, không phải mô hình AI đã được kiểm định độ chính xác. Nên thử vợt trực tiếp và kiểm tra trọng lượng, độ cứng thân, giá, hàng tồn trước khi mua.

## Bản Python trước đây

`main.py` là prototype KNN chạy trong terminal từ phiên bản ban đầu. Web app hiện dùng `engine.mjs` để xếp hạng minh bạch và không cần backend.

Để xuất bản qua GitHub Pages: trong **Settings → Pages**, chọn **Deploy from a branch**, branch **master**, folder **/(root)**, rồi Save. Sau khi triển khai, liên kết đầu README sẽ hoạt động.
