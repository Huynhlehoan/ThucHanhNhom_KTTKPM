package fit.se.paymentservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentWorker {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private EventStoreRepository eventStoreRepository;

    @Autowired
    private WalletReadModelRepository walletReadModelRepository;

    // 1. Lắng nghe đăng ký -> Cộng 500k
    @KafkaListener(topics = "user-events", groupId = "payment-group")
    public void handleUserEvent(Map<String, Object> event) {
        if ("USER_REGISTERED".equals(event.get("eventType"))) {
            String userId = (String) event.get("userId");
            if (userId != null && !walletReadModelRepository.existsById(userId)) {
                // Event Sourcing: Lưu lịch sử
                eventStoreRepository.save(new EventStore(userId, "ACCOUNT_INITIALIZED", 500000));
                // CQRS: Cập nhật bảng Read để check số dư cho nhanh
                walletReadModelRepository.save(new WalletReadModel(userId, 500000));
                System.out.println(">>> [PAYMENT] Đã khởi tạo ví 500k cho user: " + userId);
            }
        }
    }

    // 2. Lắng nghe Đặt vé -> Trừ tiền có áp dụng Dead Letter Queue
    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 2000, multiplier = 2.0),
        dltTopicSuffix = "-dlt" // Tự động ném vào topic `booking-events-dlt` nếu lỗi 3 lần
    )
    @KafkaListener(topics = "booking-events", groupId = "payment-group")
    public void processPayment(Map<String, Object> event) {
        if (!"BOOKING_CREATED".equals(event.get("eventType"))) {
            return;
        }

        String bookingId = (String) event.get("bookingId");
        String userId = (String) event.get("userId");
        double amount = Double.parseDouble(event.get("amount").toString());

        System.out.println(">>> [PAYMENT] Nhận yêu cầu thanh toán cho đơn: #" + bookingId + " của user: " + userId);

        // CQRS: Đọc số dư cực nhanh từ bảng WalletReadModel
        WalletReadModel wallet = walletReadModelRepository.findById(userId).orElse(null);

        Map<String, Object> resultEvent = new HashMap<>();
        resultEvent.put("bookingId", bookingId);
        resultEvent.put("userId", userId);

        if (wallet != null && wallet.getBalance() >= amount) {
            // Event Sourcing: Ghi log trừ tiền
            eventStoreRepository.save(new EventStore(userId, "FUNDS_DEDUCTED", -amount));
            
            // CQRS: Update số dư mới
            wallet.setBalance(wallet.getBalance() - amount);
            walletReadModelRepository.save(wallet);

            System.out.println(">>> [PAYMENT] Thanh toán thành công, số dư còn: " + wallet.getBalance());

            resultEvent.put("status", "SUCCESS");
            resultEvent.put("eventType", "PAYMENT_COMPLETED");
        } else {
            System.out.println(">>> [PAYMENT] Thanh toán thất bại, không đủ tiền hoặc user không tồn tại.");
            resultEvent.put("status", "FAILED");
            resultEvent.put("eventType", "BOOKING_FAILED");
            resultEvent.put("reason", "Insufficient funds");
        }

        kafkaTemplate.send("payment-events", resultEvent);
    }
}