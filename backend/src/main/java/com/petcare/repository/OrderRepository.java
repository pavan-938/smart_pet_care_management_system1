package com.petcare.repository;

import com.petcare.entity.Order;
import com.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
    List<Order> findByUserId(Long userId);
    boolean existsByUserId(Long userId);

    /**
     * Monthly revenue (excluding cancelled orders): returns [monthNumber,
     * totalAmount]
     */
    @Query("SELECT MONTH(o.orderDate), SUM(o.totalAmount) FROM Order o " +
            "WHERE o.orderDate >= :since AND o.status <> 'CANCELLED' " +
            "GROUP BY MONTH(o.orderDate) ORDER BY MONTH(o.orderDate)")
    List<Object[]> revenueByMonth(LocalDateTime since);
}
