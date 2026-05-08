package com.example.demo.Services;

import com.example.demo.payload.dto.SubscriptionPlanDTO;

import java.util.List;

public interface SubscriptionPlanService {

    SubscriptionPlanDTO createSubscriptionPlan(SubscriptionPlanDTO planDTO) throws Exception;

    SubscriptionPlanDTO updateSubscriptionPlan(Long planId, SubscriptionPlanDTO planDTO) throws Exception;

    void deleteSubscriptionPlan(Long planId) throws Exception;

    List<SubscriptionPlanDTO> getAllSubscriptionPlan();

}
