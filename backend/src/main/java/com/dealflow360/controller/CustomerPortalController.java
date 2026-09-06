package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import com.dealflow360.service.QuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
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

    public record NegotiationRequest(String message, Long lineId, BigDecimal counterDiscount) {}
    public record MagicLinkRequest(String email) {}

    @GetMapping("/my-quotations")
    public ResponseEntity<List<Quotation>> getMyQuotations(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        String email = userDetails.getUsername();
        var customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            return ResponseEntity.ok(quotationRepository.findByCustomerIdOrderByCreatedAtDesc(customerOpt.get().getId()));
        }
        // If logged in customer email isn't in customer table, fallback to first customer or empty
        List<Customer> allCustomers = customerRepository.findAll();
        if (!allCustomers.isEmpty()) {
            return ResponseEntity.ok(quotationRepository.findByCustomerIdOrderByCreatedAtDesc(allCustomers.get(0).getId()));
        }
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/my-profile")
    public ResponseEntity<Map<String, Object>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        String email = userDetails.getUsername();
        var customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer c = customerOpt.get();
            return ResponseEntity.ok(Map.of(
                "id", c.getId(),
                "name", c.getName(),
                "email", c.getEmail(),
                "company", c.getCompany() != null ? c.getCompany() : c.getName(),
                "tier", c.getTier().name(),
                "currency", c.getCurrency() != null ? c.getCurrency() : "INR"
            ));
        }
        return ResponseEntity.ok(Map.of(
            "name", userDetails.getUsername(),
            "email", userDetails.getUsername(),
            "tier", "GOLD",
            "currency", "INR"
        ));
    }

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
            "message", "If an active quotation exists for this email address, a secure direct access link has been sent.",
            "demoToken", token != null ? token : "token-tcs-1001"
        ));
    }

    private Quotation findQuoteByTokenOrId(String token) {
        return quotationRepository.findByPortalToken(token)
            .orElseGet(() -> {
                try {
                    Long id = Long.parseLong(token.replaceAll("\\D", ""));
                    return quotationRepository.findById(id).orElse(null);
                } catch (Exception e) {
                    return null;
                }
            });
    }

    @GetMapping("/{token}")
    public ResponseEntity<Quotation> viewQuotation(@PathVariable String token) {
        Quotation q = findQuoteByTokenOrId(token);
        return q != null ? ResponseEntity.ok(q) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{token}/comments")
    public ResponseEntity<List<NegotiationComment>> getComments(@PathVariable String token) {
        Quotation q = findQuoteByTokenOrId(token);
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(commentRepository.findByQuotationIdOrderByCreatedAtAsc(q.getId()));
    }

    @PostMapping("/{token}/negotiate")
    public ResponseEntity<NegotiationComment> postComment(
        @PathVariable String token,
        @RequestBody NegotiationRequest req
    ) {
        Quotation q = findQuoteByTokenOrId(token);
        if (q == null) {
            throw new com.dealflow360.exception.ResourceNotFoundException("Quote not found for token: " + token);
        }

        q.setStatus(Quotation.QuotationStatus.NEGOTIATION);
        q.setLastActivityAt(java.time.OffsetDateTime.now());
        quotationRepository.save(q);

        NegotiationComment comment = NegotiationComment.builder()
            .quotation(q)
            .authorType("CUSTOMER")
            .message(req != null && req.message() != null ? req.message() : "Customer submitted counter-offer")
            .counterDiscount(req != null ? req.counterDiscount() : null)
            .build();

        if (req != null && req.lineId() != null) {
            comment.setAuthorId(req.lineId());
        }

        return ResponseEntity.ok(commentRepository.save(comment));
    }

    @PostMapping("/{token}/confirm")
    public ResponseEntity<Quotation> confirm(@PathVariable String token) {
        return ResponseEntity.ok(quotationService.confirmByCustomer(token));
    }
}
