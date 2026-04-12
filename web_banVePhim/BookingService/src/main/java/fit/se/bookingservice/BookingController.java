package fit.se.bookingservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, String> payload) {
        // Lấy dữ liệu từ JSON Body gửi lên
        String userId = payload.getOrDefault("userId", "guest-user");
        String movieId = payload.get("movieId");

        // Kiểm tra nhanh để tránh lỗi NullPointerException
        if (movieId == null || movieId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "movieId không được để trống!"));
        }

        // Gọi Service xử lý
        Booking newBooking = bookingService.createBooking(userId, movieId);

        // Trả về JSON khớp với những gì React đang mong đợi (.id hoặc .bookingId)
        return ResponseEntity.ok(Map.of(
                "message", "Đã ghi nhận PENDING!",
                "id", newBooking.getId(), // Thêm trường id này để React nhận được data.id
                "bookingId", newBooking.getId(),
                "status", newBooking.getStatus()
        ));
    }
}