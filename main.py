import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
import warnings

# Bỏ qua cảnh báo hiển thị cho đẹp
warnings.filterwarnings("ignore")


def load_data_and_train():
    # 1. Đọc dữ liệu (Đường dẫn trỏ vào thư mục data)
    print("⏳ Đang tải dữ liệu và huấn luyện AI...")
    df = pd.read_csv('data/racket_dataset.csv')

    # 2. Huấn luyện mô hình KNN
    X = df[['Diem_Cong', 'Diem_Thu', 'Gia_Trieu']]
    y = df['Ten_Vot']

    knn_model = KNeighborsClassifier(n_neighbors=3)
    knn_model.fit(X, y)

    return knn_model, df


def tu_van_vot(knn_model, df, diem_cong, diem_thu, ngan_sach):
    # 3. Tạo dữ liệu dự đoán
    khach_hang = pd.DataFrame({'Diem_Cong': [diem_cong], 'Diem_Thu': [diem_thu], 'Gia_Trieu': [ngan_sach]})

    # 4. Dự đoán
    cay_vot_goi_y = knn_model.predict(khach_hang)[0]
    thong_tin = df[df['Ten_Vot'] == cay_vot_goi_y].iloc[0]

    # 5. In kết quả
    print("\n" + "=" * 45)
    print("🎯 KẾT QUẢ TƯ VẤN TỪ AI 🎯")
    print("=" * 45)
    print(f"🏸 Vợt đề xuất: {cay_vot_goi_y}")
    print(f"🔥 Phong cách:  {thong_tin['Phong_Cach']}")
    print(f"💰 Mức giá:     {thong_tin['Gia_Trieu']} Triệu VNĐ")
    print("=" * 45)


if __name__ == "__main__":
    # Khởi chạy ứng dụng
    model, dataframe = load_data_and_train()
    print("✅ Hệ thống đã sẵn sàng!\n")

    # Nhập thông số từ bàn phím (Tương tác trực tiếp)
    print("Nhập nhu cầu của bạn (Thang điểm 1-10):")
    cong = float(input("👉 Điểm kích thích Tấn Công (Công): "))
    thu = float(input("👉 Điểm kích thích Phản Tạt (Thủ): "))
    tien = float(input("👉 Ngân sách tối đa (Triệu VNĐ - VD: 1.5): "))

    # Gọi hàm
    tu_van_vot(model, dataframe, cong, thu, tien)
