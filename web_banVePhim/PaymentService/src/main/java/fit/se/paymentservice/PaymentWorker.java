package fit.se.paymentservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentWorker {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    // Listen: BOOKING_CREATED (Từ Booking Service gửi sang)
    @KafkaListener(topics = "booking-events", groupId = "payment-group")
    public void processPayment(Map<String, Object> event) {

        // Kiểm tra xem có đúng là event tạo booking không
        String eventTypeReceived = (String) event.get("eventType");
        if (!"BOOKING_CREATED".equals(eventTypeReceived)) {
            return; // Bỏ qua nếu là event khác
        }

        String bookingId = (String) event.get("bookingId");
        String userId = (String) event.getOrDefault("userId", "User A"); // Lấy userId nếu có
        System.out.println(">>> [PAYMENT] Nhận yêu cầu thanh toán cho đơn: #" + bookingId);

        // Xử lý: Random success/fail
        boolean isSuccess = Math.random() > 0.5;

        // Xác định Event Type theo đề bài
        String eventType = isSuccess ? "PAYMENT_COMPLETED" : "BOOKING_FAILED";

        // Giữ thêm field status (SUCCESS/FAILED) để BookingService của bạn dễ update DB
        String status = isSuccess ? "SUCCESS" : "FAILED";

        System.out.println(">>> [PAYMENT] Kết quả xử lý: " + eventType);

        // Publish: PAYMENT_COMPLETED hoặc BOOKING_FAILED
        Map<String, Object> resultEvent = new HashMap<>();
        resultEvent.put("bookingId", bookingId);
        resultEvent.put("userId", userId);
        resultEvent.put("status", status);
        resultEvent.put("eventType", eventType);

        kafkaTemplate.send("payment-events", resultEvent);
    }
}