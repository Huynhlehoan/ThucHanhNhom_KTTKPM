package fit.se.movieservice;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "showtimes")
@Data
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "movie_id")
    private String movieId; // Nối với Movie.id
    private String time;
    private String screen;
    private String language;
    private String format;
}