# 🏸 AI Badminton Racket Recommender

Hệ thống ứng dụng AI (Machine Learning) để tư vấn cây vợt cầu lông phù hợp nhất cho người chơi dựa trên lối đánh và ngân sách.

## 🚀 Tính năng nổi bật
- Áp dụng thuật toán **K-Nearest Neighbors (KNN)** từ thư viện `scikit-learn`.
- Cơ sở dữ liệu đa dạng với 35 mẫu vợt phổ biến (Yonex, Lining, Victor, Mizuno...).
- Tính toán khoảng cách Euclidean (Euclidean Distance) trên không gian 3 chiều: Sức mạnh (Công), Tốc độ (Thủ), và Giá tiền.

## 💻 Hướng dẫn sử dụng
Cài đặt thư viện:
```bash
pip install pandas scikit-learn numpy