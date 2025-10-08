package com.saverio.wesportbackend.repository;

import com.saverio.wesportbackend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByEvent_Id(Long eventId);
    void deleteAllByEvent_Id(Long eventId);
}
