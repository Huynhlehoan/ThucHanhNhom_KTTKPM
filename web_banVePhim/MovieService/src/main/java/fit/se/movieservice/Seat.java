package fit.se.movieservice;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seats")
@Data
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "showtime_id")
    private Long showtimeId; // Nối với Showtime.id
    private String rowName;  // A, B, C... (Đổi tên thành rowName vì 'row' là từ khóa của SQL)
    private int seatNumber;
    private String type;     // vip, sofa, regular
    private String status;   // available, reserved
    private double price;
}