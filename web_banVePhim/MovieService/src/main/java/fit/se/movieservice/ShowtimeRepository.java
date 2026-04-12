package fit.se.movieservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(String movieId);
}
