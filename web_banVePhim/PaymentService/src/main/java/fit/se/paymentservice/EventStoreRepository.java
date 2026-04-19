package fit.se.paymentservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventStoreRepository extends JpaRepository<EventStore, Long> {
    java.util.List<EventStore> findByUserId(String userId);
}
