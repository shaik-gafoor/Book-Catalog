package com.example.demo.Services.impl;

import com.example.demo.Services.SubscriptionPlanService;
import com.example.demo.Services.UserService;
import com.example.demo.mapper.SubscriptionPlanMapper;
import com.example.demo.model.SubscriptionPlan;
import com.example.demo.model.User;
import com.example.demo.payload.dto.SubscriptionPlanDTO;
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanMapper planMapper;
    private final UserService userService;

    @Override
    public SubscriptionPlanDTO createSubscriptionPlan(SubscriptionPlanDTO planDTO) throws Exception {
        if(planRepository.existsByPlanCode(planDTO.getPlanCode())){
            throw new Exception("plan code is already exist ");
        }
        SubscriptionPlan plan = planMapper.toEntity(planDTO);
        UserDTO currentUser = userService.getCurrentUser();
        plan.setCreatedBy(currentUser.getFullName());
        plan.setUpdatedBy(currentUser.getFullName());
        SubscriptionPlan savedPlan = planRepository.save(plan);
        return planMapper.toDTO(savedPlan);
    }



    @Override
    public SubscriptionPlanDTO updateSubscriptionPlan(Long planId, SubscriptionPlanDTO planDTO) throws Exception {
        SubscriptionPlan existingPlan = planRepository.findById(planId).orElseThrow(
                ()->new Exception("plan not found!")
        );
        planMapper.updateEntity(existingPlan,planDTO);
        UserDTO currentUser = userService.getCurrentUser();
        existingPlan.setUpdatedBy(currentUser.getFullName());
        SubscriptionPlan updatedPlan = planRepository.save(existingPlan);
        return planMapper.toDTO(updatedPlan);
    }



    @Override
    public void deleteSubscriptionPlan(Long planId) throws Exception {
        SubscriptionPlan existingPlan = planRepository.findById(planId).orElseThrow(
                ()->new Exception("plan not found!")
        );
        planRepository.delete(existingPlan);
    }



    @Override
    public List<SubscriptionPlanDTO> getAllSubscriptionPlan() {
        List<SubscriptionPlan> planList = planRepository.findAll();
        return planList.stream().map(
                planMapper::toDTO
        ).collect(Collectors.toList());
    }
}
