package fit.se.paymentservice;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventStore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private String eventType; // ACCOUNT_INITIALIZED, FUNDS_DEDUCTED
    private double amount;
    private LocalDateTime timestamp = LocalDateTime.now();

    public EventStore(String userId, String eventType, double amount) {
        this.userId = userId;
        this.eventType = eventType;
        this.amount = amount;
    }
}
