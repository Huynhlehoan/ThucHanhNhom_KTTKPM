package fit.se.movieservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
//@CrossOrigin("*") // Cho phép React gọi API không bị lỗi CORS
public class MovieController {

    @Autowired
    private MovieService movieService;

    // API lấy danh sách tất cả các phim
    @GetMapping
    public ResponseEntity<List<Movie>> getMovies() {
        List<Movie> movies = movieService.getAllMovies();
        return ResponseEntity.ok(movies);
    }

    // API lấy chi tiết 1 phim (Ví dụ gọi: /api/movies/1)
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovie(@PathVariable String id) {
        Movie movie = movieService.getMovieById(id);
        if (movie != null) {
            return ResponseEntity.ok(movie);
        }
        return ResponseEntity.notFound().build();
    }
    // Lấy lịch chiếu của 1 bộ phim
    @GetMapping("/{movieId}/shows")
    public ResponseEntity<List<Showtime>> getShowsByMovie(@PathVariable String movieId) {
        return ResponseEntity.ok(movieService.getShowsByMovieId(movieId));
    }

    // Lấy sơ đồ ghế của 1 suất chiếu cụ thể
    @GetMapping("/shows/{showId}/seats")
    public ResponseEntity<List<Seat>> getSeatsByShow(@PathVariable Long showId) {
        return ResponseEntity.ok(movieService.getSeatsByShowtimeId(showId));
    }

    // Thêm phim mới
    @PostMapping
    public ResponseEntity<Movie> addMovie(@RequestBody Movie movie) {
        return ResponseEntity.ok(movieService.saveMovie(movie));
    }

    // Sửa phim
    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable String id, @RequestBody Movie movie) {
        movie.setId(id);
        return ResponseEntity.ok(movieService.saveMovie(movie));
    }
}