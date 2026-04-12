package fit.se.movieservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class MovieService implements ApplicationRunner { // 1. Thêm implements ApplicationRunner

    @Autowired private MovieRepository movieRepository;
    @Autowired private ShowtimeRepository showtimeRepository;
    @Autowired private SeatRepository seatRepository;

    public List<Movie> getAllMovies() { return movieRepository.findAll(); }
    public Movie getMovieById(String id) { return movieRepository.findById(id).orElse(null); }
    public List<Showtime> getShowsByMovieId(String movieId) { return showtimeRepository.findByMovieId(movieId); }
    public List<Seat> getSeatsByShowtimeId(Long showtimeId) { return seatRepository.findByShowtimeId(showtimeId); }

    // 2. XÓA BỎ @PostConstruct, thay bằng hàm run này
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(">>> App đã khởi động xong, đang kiểm tra dữ liệu...");
        generateSeatsForShows();
    }

    public void generateSeatsForShows() {
        List<Showtime> shows = showtimeRepository.findAll();
        // Log này để Hoa kiểm tra xem có thấy lịch chiếu nào không
        System.out.println(">>> Tìm thấy " + shows.size() + " suất chiếu trong DB.");

        for (Showtime show : shows) {
            if (seatRepository.findByShowtimeId(show.getId()).isEmpty()) {
                List<Seat> seats = new ArrayList<>();
                String[] rows = {"A", "B", "C", "D", "E", "F"};
                for (String row : rows) {
                    for (int num = 1; num <= 8; num++) {
                        Seat seat = new Seat();
                        seat.setShowtimeId(show.getId());
                        seat.setRowName(row);
                        seat.setSeatNumber(num);
                        seat.setStatus("available");
                        if (row.equals("A") || row.equals("B")) { seat.setType("vip"); seat.setPrice(20); }
                        else if (row.equals("C") || row.equals("D")) { seat.setType("sofa"); seat.setPrice(16); }
                        else { seat.setType("regular"); seat.setPrice(12); }
                        if (Math.random() < 0.15) seat.setStatus("reserved");
                        seats.add(seat);
                    }
                }
                seatRepository.saveAll(seats);
                System.out.println(">>> Đã sinh ghế cho Show ID: " + show.getId());
            }
        }
    }
}