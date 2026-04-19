package fit.se.bookingservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class BookingEventListener {

    @Autowired
    private BookingCommandService bookingService;

    @KafkaListener(topics = "payment-events", groupId = "booking-group")
    public void listenPayment(Map<String, Object> event) {
        System.out.println(">>> [BOOKING] Nhận kết quả thanh toán từ Kafka: " + event);
        
        try {
            String bookingId = (String) event.get("bookingId");
            String status = (String) event.get("status");

            if (bookingId != null && status != null) {
                bookingService.updateBookingStatus(bookingId, status);
                System.out.println(">>> [BOOKING] Đã cập nhật trạng thái vé " + bookingId + " thành " + status);
            }
        } catch (Exception e) {
            System.err.println(">>> [BOOKING] Lỗi khi xử lý event payment: " + e.getMessage());
        }
    }
}