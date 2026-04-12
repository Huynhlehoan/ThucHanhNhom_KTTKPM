package fit.se.bookingservice;
import fit.se.bookingservice.Booking;
import fit.se.bookingservice.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    // Logic 1: Tạo đơn hàng mới
    @Transactional
    public Booking createBooking(String userId, String movieId) {
        // 1. Lưu DB trạng thái PENDING
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setMovieId(movieId);
        booking.setAmount(150000);
        booking.setStatus("PENDING");
        bookingRepository.save(booking);

        // 2. Bắn Event cho Payment
        Map<String, Object> event = Map.of(
                "bookingId", booking.getId(),
                "movieId", movieId,
                "amount", booking.getAmount(),
                "eventType", "BOOKING_CREATED"
        );
        kafkaTemplate.send("booking-events", event);

        return booking;
    }

    // Logic 2: Cập nhật trạng thái sau khi Payment trả kết quả
    @Transactional
    public void updateBookingStatus(String bookingId, String status) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            // Nếu Payment SUCCESS -> CONFIRMED, FAILED -> CANCELLED
            booking.setStatus("SUCCESS".equals(status) ? "CONFIRMED" : "CANCELLED");
            bookingRepository.save(booking);
            System.out.println(">>> Đã update DB: Booking " + bookingId + " thành " + booking.getStatus());
        }
    }
}