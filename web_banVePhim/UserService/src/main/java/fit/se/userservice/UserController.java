package fit.se.userservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        try {
            User user = userService.register(payload.get("username"), payload.get("password"));
            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công", "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đăng ký thất bại: Tài khoản có thể đã tồn tại"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        User user = userService.login(payload.get("username"), payload.get("password"));
        if (user != null) {
            return ResponseEntity.ok(Map.of(
                "message", "Đăng nhập thành công",
                "userId", user.getId(),
                "username", user.getUsername()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu"));
    }
}