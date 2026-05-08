package com.example.demo.repository;

import com.example.demo.model.SubscriptionPlan;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    boolean existsByPlanCode(@NotBlank(message = "Plan code is mandatory") String planCode);
}
