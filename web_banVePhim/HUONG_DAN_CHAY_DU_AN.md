# 📘 Hướng dẫn vận hành & Giải thích Kiến trúc Event-Driven

Tài liệu này hướng dẫn cách triển khai hệ thống bán vé phim trên 3 máy vật lý và giải thích chi tiết luồng code chạy bên trong.

---

## 🚀 1. Cách chạy dự án

### Phương án A: Chạy tất cả trên 1 máy (Local Test)
Nếu bạn chỉ có 1 máy và muốn test nhanh toàn bộ luồng:
1.  Mở file `.env`, đặt tất cả `IP_MAY1`, `IP_MAY2`, `IP_MAY3` thành `127.0.0.1`.
2.  Mở Terminal và chạy:
    ```powershell
    docker-compose -f docker-compose-all.yml up -d --build
    ```
3.  Dừng hệ thống: `docker-compose -f docker-compose-all.yml down`

### Phương án B: Chạy trên 3 máy vật lý (Phân tán)
Dành cho việc demo hệ thống thực tế trên mạng LAN:
1.  Xác định IP LAN của 3 máy (dùng lệnh `ipconfig`).
2.  Cấu hình IP thật vào file `.env` (phải giống nhau trên cả 3 máy).
3.  Chạy các file tương ứng trên từng máy:

*   **Tại Máy 1 (Hạ tầng):** `docker-compose -f docker-compose-may1.yml up -d --build`
*   **Tại Máy 2 (Nghiệp vụ):** `docker-compose -f docker-compose-may2.yml up -d --build`
*   **Tại Máy 3 (Thanh toán):** `docker-compose -f docker-compose-may3.yml up -d --build`

---

## 🏗 2. Phân chia nhiệm vụ chi tiết giữa các máy

Hệ thống được thiết kế để chạy phân tán. Bạn chỉ cần cài **Docker** trên cả 3 máy, không cần cài Java hay Database rời vì Docker sẽ tự lo.

### Máy 1: Máy chủ hạ tầng (Infrastructure)
*   **Thành phần chạy:**
    *   **Zookeeper & Kafka**: "Trạm trung chuyển" tin nhắn cho toàn hệ thống.
    *   **Gateway Service**: Cửa ngõ duy nhất nhận yêu cầu từ Frontend và điều hướng đến các máy khác.
    *   **Frontend**: Giao diện người dùng (React).
*   **Lệnh chạy:** `docker-compose -f docker-compose-may1.yml up -d --build`

### Máy 2: Máy chủ nghiệp vụ (Business Logic)
*   **Thành phần chạy:**
    *   **MariaDB (may2)**: Lưu trữ dữ liệu phim và vé.
    *   **User Service**: Quản lý đăng nhập/đăng ký.
    *   **Movie Service**: Quản lý danh sách phim và lịch chiếu.
    *   **Booking Service**: Xử lý đặt vé.
*   **Lệnh chạy:** `docker-compose -f docker-compose-may2.yml up -d --build`

### Máy 3: Máy chủ thanh toán (Payment & Wallet)
*   **Thành phần chạy:**
    *   **MariaDB (may3)**: Lưu trữ số dư ví và lịch sử sự kiện (Event Store).
    *   **Payment Service**: Xử lý trừ tiền, nạp tiền, hoàn tiền.
*   **Lệnh chạy:** `docker-compose -f docker-compose-may3.yml up -d --build`

---

## 🛑 2. Cách dừng hệ thống

Bạn phải dừng ở máy nào thì dùng lệnh ở máy đó:

*   **Dừng bình thường (Giữ dữ liệu):**
    ```powershell
    docker-compose -f docker-compose-mayX.yml stop
    ```
*   **Dừng và xóa container (Sạch sẽ):**
    ```powershell
    docker-compose -f docker-compose-mayX.yml down
    ```
*   **Dừng và xóa sạch cả Database (Dùng khi muốn làm mới hoàn toàn dữ liệu):**
    ```powershell
    docker-compose -f docker-compose-mayX.yml down -v
    ```

---

## 🧠 3. Giải thích luồng Code (Deep Dive)

Đây là cách code vận hành khi bạn nhấn nút "Đặt vé":

### Giai đoạn 1: Khởi tạo đơn hàng (Máy 1 -> Máy 2)
1.  **Frontend**: Gửi yêu cầu `POST /api/bookings` tới **Gateway** (Máy 1).
2.  **Gateway**: Chuyển tiếp yêu cầu tới **BookingController** (Máy 2).
3.  **BookingCommandService**:
    *   Tạo một đối tượng `Booking` mới trong Database với trạng thái là `PENDING`.
    *   Tạo một tin nhắn (Event) chứa: `bookingId`, `userId`, `amount`.
    *   **Kafka**: Gửi tin nhắn này vào topic `booking-events`.

### Giai đoạn 2: Xử lý thanh toán (Máy 2 -> Máy 1 -> Máy 3)
1.  **Kafka (Máy 1)**: Nhận tin nhắn và giữ đó.
2.  **PaymentWorker (Máy 3)**: Đang "ngồi chờ" (Listen) topic `booking-events`. Khi thấy tin nhắn mới, nó sẽ nhặt về xử lý:
    *   Kiểm tra ví của User trong DB (MariaDB-may3).
    *   Nếu đủ tiền: Trừ tiền -> Lưu vào **EventStore** (Lịch sử sự kiện) -> Gửi tin nhắn `SUCCESS` vào topic `payment-events`.
    *   Nếu thiếu tiền: Gửi tin nhắn `FAILED` vào topic `payment-events`.

### Giai đoạn 3: Hoàn tất đơn hàng (Máy 3 -> Máy 1 -> Máy 2)
1.  **BookingEventListener (Máy 2)**: Đang chờ topic `payment-events`. Khi nhận được kết quả từ Máy 3:
    *   Nếu là `SUCCESS`: Gọi `bookingRepository` cập nhật trạng thái vé thành `CONFIRMED`.
    *   Nếu là `FAILED`: Cập nhật trạng thái vé thành `CANCELLED`.
2.  **Frontend**: Khi người dùng vào trang Lịch sử vé, **BookingQueryService** sẽ lấy dữ liệu mới nhất từ DB và hiển thị "Đã xác nhận" hoặc "Đã hủy".

---

## 🛠 Lưu ý về kết nối (Quan trọng nhất)

*   **Tại sao không cần chạy Service Java tay?** 
    Trong file `docker-compose.yml`, dòng `build: ./BookingService` nói với Docker rằng: "Hãy vào thư mục này, đóng gói code Java thành một Docker Image và chạy nó lên". Do đó, bạn chỉ cần code xong, lưu lại và chạy lệnh Docker.
*   **Kết nối Kafka:** 
    Các máy kết nối với nhau qua IP vật lý. Nếu Máy 2 không kết nối được Kafka ở Máy 1, toàn bộ luồng trên sẽ bị kẹt ở bước **Giai đoạn 1** (Vé mãi ở `PENDING`). Luôn đảm bảo `ping` thông giữa các máy trước khi chạy.
