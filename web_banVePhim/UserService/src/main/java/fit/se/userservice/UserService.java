package fit.se.userservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class UserService { 

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public User register(String username, String password) {
        if (userRepository.findFirstByUsername(username) != null) {
            throw new RuntimeException("Tài khoản đã tồn tại");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); 
        userRepository.save(user);

        Map<String, Object> event = Map.of(
                "userId", user.getId(),
                "username", username,
                "eventType", "USER_REGISTERED"
        );

        kafkaTemplate.send("user-events", event);

        System.out.println(">>> Đã gửi event đăng ký user: " + username);
        return user;
    }

    public User login(String username, String password) {
        User user = userRepository.findFirstByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }
}