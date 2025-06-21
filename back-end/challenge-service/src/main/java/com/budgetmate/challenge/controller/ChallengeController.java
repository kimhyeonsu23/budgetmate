package com.budgetmate.challenge.controller;

import com.budgetmate.challenge.dto.ChallengeRequestDto;
import com.budgetmate.challenge.dto.ChallengeResponseDto;
import com.budgetmate.challenge.service.ChallengeService;
import com.budgetmate.challenge.util.TokenParser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;
    private final TokenParser tokenParser;

    //  챌린지 등록
    @PostMapping("/create")
    public ResponseEntity<ChallengeResponseDto> createChallenge(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChallengeRequestDto requestDto) {
        Long userId = tokenParser.getUserIdFromToken(authHeader);
        return ResponseEntity.ok(challengeService.createChallenge(userId, requestDto));
    }

    //  내 챌린지 목록 조회
    @GetMapping("/my")
    public ResponseEntity<List<ChallengeResponseDto>> getMyChallenges(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenParser.getUserIdFromToken(authHeader);
        return ResponseEntity.ok(challengeService.getChallenges(userId));
    }

    //  챌린지 삭제 (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }
}
