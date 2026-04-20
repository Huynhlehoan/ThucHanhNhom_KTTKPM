package fit.se.bookingservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;

@Service
public class BookingCommandService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    // Xử lý tạo đơn hàng (Command)
    @Transactional
    public Booking createBooking(String userId, String movieId, String seatIds, double amount) {
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setMovieId(movieId);
        booking.setSeatIds(seatIds);
        booking.setAmount(amount);
        booking.setStatus("PENDING");
        bookingRepository.save(booking);

        Map<String, Object> event = Map.of(
                "bookingId", booking.getId(),
                "userId", userId,
                "movieId", movieId,
                "seatIds", seatIds,
                "amount", booking.getAmount(),
                "eventType", "BOOKING_CREATED"
        );
        kafkaTemplate.send("booking-events", event);

        return booking;
    }

    // Xử lý cập nhật trạng thái (Command)
    @Transactional
    public void updateBookingStatus(String bookingId, String status) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStatus("SUCCESS".equals(status) ? "CONFIRMED" : "CANCELLED");
            bookingRepository.save(booking);
        }
    }
}
