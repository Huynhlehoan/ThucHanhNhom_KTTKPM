package fit.se.bookingservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookingQueryService {

    @Autowired
    private BookingRepository bookingRepository;

    // Truy vấn danh sách vé của User (Query)
    public List<Booking> findByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Truy vấn chi tiết vé (Query)
    public Optional<Booking> findById(String id) {
        return bookingRepository.findById(id);
    }

    // Truy vấn tất cả (Query)
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }
}
