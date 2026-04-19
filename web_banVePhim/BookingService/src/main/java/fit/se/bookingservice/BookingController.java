package fit.se.bookingservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingCommandService commandService;

    @Autowired
    private BookingQueryService queryService;

    // GHI (Command): Tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String movieId = payload.get("movieId");

        System.out.println(">>> [BOOKING] Nhận yêu cầu đặt vé: User=" + userId + ", Movie=" + movieId);

        if (userId == null || userId.equals("undefined")) {
            return ResponseEntity.badRequest().body(Map.of("error", "UserId không hợp lệ!"));
        }

        if (movieId == null || movieId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "movieId không được để trống!"));
        }

        try {
            Booking newBooking = commandService.createBooking(userId, movieId);
            System.out.println(">>> [BOOKING] Đã lưu vé PENDING vào DB. ID: " + newBooking.getId());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Đã ghi nhận PENDING!",
                    "id", newBooking.getId(),
                    "bookingId", newBooking.getId(),
                    "status", newBooking.getStatus()
            ));
        } catch (Exception e) {
            System.err.println(">>> [BOOKING] LỖI khi lưu vé: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ĐỌC (Query): Lấy danh sách đơn hàng theo User
    @GetMapping
    public ResponseEntity<?> getBookingsByUserId(@RequestParam String userId) {
        System.out.println(">>> [BOOKING] Truy vấn lịch sử cho User: " + userId);
        return ResponseEntity.ok(queryService.findByUserId(userId));
    }
}