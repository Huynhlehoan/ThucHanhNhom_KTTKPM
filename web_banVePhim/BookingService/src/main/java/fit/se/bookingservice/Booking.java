package fit.se.bookingservice;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    private String id;

    private String userId;
    private String movieId;
    private String seatIds; // Lưu danh sách ID ghế cách nhau bằng dấu phẩy
    private double amount;
    private String status; // PENDING, CONFIRMED, CANCELLED

    // Constructor tự sinh ID
    public Booking() {
        this.id = UUID.randomUUID().toString();
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getMovieId() { return movieId; }
    public void setMovieId(String movieId) { this.movieId = movieId; }
    public String getSeatIds() { return seatIds; }
    public void setSeatIds(String seatIds) { this.seatIds = seatIds; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}