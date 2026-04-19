package fit.se.paymentservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentWorker paymentWorker;

    @Autowired
    private EventStoreRepository eventStoreRepository;

    @Autowired
    private WalletReadModelRepository walletReadModelRepository;

    // 1. Xem lịch sử giao dịch (Truy vết - Event Sourcing)
    @GetMapping("/history/{userId}")
    public List<EventStore> getHistory(@PathVariable String userId) {
        return eventStoreRepository.findByUserId(userId);
    }

    // 2. Xem số dư hiện tại (Read Model - CQRS)
    @GetMapping("/wallet/{userId}")
    public WalletReadModel getWallet(@PathVariable String userId) {
        WalletReadModel wallet = walletReadModelRepository.findById(userId).orElse(null);
        
        // Nếu là user cũ chưa có ví, tự động khởi tạo 500k để test cho dễ
        if (wallet == null) {
            System.out.println(">>> [PAYMENT] Khởi tạo ví tự động cho user cũ: " + userId);
            paymentWorker.handleUserEvent(Map.of("eventType", "USER_REGISTERED", "userId", userId));
            wallet = walletReadModelRepository.findById(userId).orElse(null);
        }
        
        return wallet;
    }

    // 3. REPLAY - Khôi phục số dư từ lịch sử (Event Sourcing Demo)
    @PostMapping("/replay/{userId}")
    public double replay(@PathVariable String userId) {
        return paymentWorker.replayBalance(userId);
    }
}
