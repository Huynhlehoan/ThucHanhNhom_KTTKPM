package fit.se.movieservice;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "movies")
@Data
public class Movie {
    @Id
    private String id;

    private String title;

    @Column(length = 1000)
    private String poster;

    private double rating;

    @Column(length = 2000)
    private String description;
    @Column(name = "shows_per_day")
    private int showsPerDay;

    private String formats;

    private String genre;
    private String duration;
    private String language;
}