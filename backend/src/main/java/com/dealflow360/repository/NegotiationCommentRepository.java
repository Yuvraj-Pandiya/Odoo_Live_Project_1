package com.dealflow360.repository;

import com.dealflow360.entity.NegotiationComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NegotiationCommentRepository extends JpaRepository<NegotiationComment, Long> {
    List<NegotiationComment> findByQuotationIdOrderByCreatedAtAsc(Long quotationId);
}
