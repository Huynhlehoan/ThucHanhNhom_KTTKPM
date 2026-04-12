package fit.se.bookingservice;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class BookingEventListener {

    @Autowired
    private BookingService bookingService;

    @KafkaListener(topics = "payment-events", groupId = "booking-group")
    public void listenPayment(Map<String, String> event) {
        String bookingId = event.get("bookingId");
        String status = event.get("status");

        // Gọi Service update vào Database
        bookingService.updateBookingStatus(bookingId, status);
    }
}