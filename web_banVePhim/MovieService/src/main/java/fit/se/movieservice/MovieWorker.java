package fit.se.movieservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.Arrays;

@Component
public class MovieWorker {

    @Autowired
    private SeatRepository seatRepository;

    @KafkaListener(topics = "payment-events", groupId = "movie-group")
    public void handlePaymentEvent(Map<String, Object> event) {
        System.out.println(">>> [MOVIE] Nhận được sự kiện thanh toán: " + event);
        
        String eventType = (String) event.get("eventType");
        String status = (String) event.get("status");
        
        if ("PAYMENT_COMPLETED".equals(eventType) && "SUCCESS".equals(status)) {
            // Thanh toán thành công -> Đánh dấu ghế là 'reserved'
            String seatIdsStr = (String) event.get("seatIds");
            if (seatIdsStr != null && !seatIdsStr.isEmpty()) {
                String[] seatIds = seatIdsStr.split(",");
                for (String seatId : seatIds) {
                    try {
                        Long id = Long.parseLong(seatId.trim());
                        seatRepository.findById(id).ifPresent(seat -> {
                            seat.setStatus("reserved");
                            seatRepository.save(seat);
                            System.out.println(">>> [MOVIE] Đã cập nhật trạng thái ghế ID: " + id + " thành RESERVED");
                        });
                    } catch (Exception e) {
                        System.err.println(">>> [MOVIE] Lỗi cập nhật ghế: " + e.getMessage());
                    }
                }
            }
        }
    }
}
