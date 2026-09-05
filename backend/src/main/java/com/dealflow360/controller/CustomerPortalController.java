package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import com.dealflow360.service.QuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class CustomerPortalController {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final NegotiationCommentRepository commentRepository;
    private final QuotationService quotationService;

    record NegotiationRequest(String message, Long lineId, BigDecimal counterDiscount) {}
    record MagicLinkRequest(String email) {}

    @PostMapping("/magic-link")
    public ResponseEntity<Map<String, Object>> requestMagicLink(@RequestBody MagicLinkRequest req) {
        String token = null;
        if (req != null && req.email() != null && !req.email().isBlank()) {
            var customerOpt = customerRepository.findByEmail(req.email().trim());
            if (customerOpt.isPresent() && customerOpt.get().getPortalToken() != null) {
                token = customerOpt.get().getPortalToken();
            }
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "If an active quotation exists for this email address, a secure direct magic access link has been sent.",
            "demoToken", token != null ? token : "token-tcs-1001"
        ));
    }

    @GetMapping("/{token}")
    public ResponseEntity<Quotation> viewQuotation(@PathVariable String token) {
        return quotationRepository.findByPortalToken(token)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{token}/comments")
    public ResponseEntity<List<NegotiationComment>> getComments(@PathVariable String token) {
        Quotation q = quotationRepository.findByPortalToken(token)
            .orElse(null);
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(commentRepository.findByQuotationIdOrderByCreatedAtAsc(q.getId()));
    }

    @PostMapping("/{token}/negotiate")
    public ResponseEntity<NegotiationComment> postComment(
        @PathVariable String token,
        @RequestBody NegotiationRequest req
    ) {
        Quotation q = quotationRepository.findByPortalToken(token)
            .orElseThrow(() -> new com.dealflow360.exception.ResourceNotFoundException("Quote not found"));

        q.setStatus(Quotation.QuotationStatus.NEGOTIATION);
        q.setLastActivityAt(java.time.OffsetDateTime.now());
        quotationRepository.save(q);

        NegotiationComment comment = NegotiationComment.builder()
            .quotation(q)
            .authorType("CUSTOMER")
            .message(req.message())
            .counterDiscount(req.counterDiscount())
            .build();

        if (req.lineId() != null) {
            // minimal reference, we just store the ID linkage
            comment.setAuthorId(req.lineId());
        }

        return ResponseEntity.ok(commentRepository.save(comment));
    }

    @PostMapping("/{token}/confirm")
    public ResponseEntity<Quotation> confirm(@PathVariable String token) {
        return ResponseEntity.ok(quotationService.confirmByCustomer(token));
    }
}
