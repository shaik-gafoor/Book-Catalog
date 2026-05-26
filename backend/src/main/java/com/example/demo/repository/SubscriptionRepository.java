package com.example.demo.repository;

import com.example.demo.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @Query("select s from Subscription s where s.user.id = :userId AND " +
            "s.isActive = true and " +
            "s.startDate<=:today and s.endDate>=:today " +
            "order by s.createdAt desc"
    )
    List<Subscription> findActiveSubscriptionsByUserId(
            @Param("userId") Long userId,
            @Param("today") LocalDate today
    );

    @Query("select s from Subscription s where s.isActive=true " +
            "AND s.endDate<:today")
    List<Subscription> findExpiredActiveSubscriptions(
            @Param("today") LocalDate today
    );

    List<Subscription> findAllByIsActiveTrue();

    List<Subscription> findAllByUserIdAndPlanCode(Long userId, String planCode);

        void deleteByUserId(Long userId);
}