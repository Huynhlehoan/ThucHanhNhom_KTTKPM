package fit.se.userservice;
import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    private String id = UUID.randomUUID().toString();
    private String username;
    private String password;
}
