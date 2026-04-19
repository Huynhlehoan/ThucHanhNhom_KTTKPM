package fit.se.paymentservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletReadModelRepository extends JpaRepository<WalletReadModel, String> {
}
