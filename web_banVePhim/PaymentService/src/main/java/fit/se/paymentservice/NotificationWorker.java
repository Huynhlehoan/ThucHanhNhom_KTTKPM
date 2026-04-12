package fit.se.paymentservice;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class NotificationWorker {

    // Listen: PAYMENT_COMPLETED (Từ PaymentWorker vừa bắn ra)
    @KafkaListener(topics = "payment-events", groupId = "notification-group")
    public void handleNotification(Map<String, Object> event) {

        String eventType = (String) event.get("eventType");
        String bookingId = (String) event.get("bookingId");
        String userId = (String) event.getOrDefault("userId", "User A");

        System.out.println("\n-------------------------------------------------");

        // Nếu event là PAYMENT_COMPLETED -> Output thông báo thành công
        if ("PAYMENT_COMPLETED".equals(eventType)) {
            // Output theo đúng 2 câu của đề bài:
            System.out.println("Booking #" + bookingId + " thành công!");
            System.out.println(userId + " đã đặt đơn #" + bookingId + " thành công");
        }
        // Bổ sung thêm case thất bại cho logic hoàn chỉnh (Tùy chọn)
        else if ("BOOKING_FAILED".equals(eventType)) {
            System.out.println("Thanh toán thất bại cho đơn #" + bookingId + ". Vui lòng thử lại!");
        }

        System.out.println("-------------------------------------------------\n");
    }
}