package fit.se.userservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class UserService { // Thêm public để Controller gọi được nhé

    @Autowired
    private UserRepository userRepository;

    // Chú ý: Khai báo String, Object là đúng rồi
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public User register(String username, String password) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // Hoa nhớ sau này dùng BCrypt để hash nha

        userRepository.save(user);

        // Tạo Event là một Map
        Map<String, Object> event = Map.of(
                "userId", user.getId(),
                "username", username,
                "eventType", "USER_REGISTERED"
        );

        // Gửi Event
        // Nếu trong properties đã sửa thành JsonSerializer thì dòng này sẽ CHẠY NGON
        kafkaTemplate.send("user-events", event);

        System.out.println(">>> Đã gửi event đăng ký user: " + username);
        return user;
    }

    public boolean login(String username, String password) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getPassword().equals(password);
    }
}