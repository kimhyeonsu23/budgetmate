package com.budgetmate.user.controller;

import com.budgetmate.user.dto.*;
import com.budgetmate.user.entity.LoginType;
import com.budgetmate.user.entity.User;
import com.budgetmate.user.security.CustomUserDetails;
import com.budgetmate.user.security.JwtTokenProvider;
import com.budgetmate.user.service.EmailService;
import com.budgetmate.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/send-code")
    public ResponseEntity<SendCodeResponse> sendCodeForSignup(@RequestBody SendCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        SendCodeResponse resp = new SendCodeResponse();

        try {
            String code = userService.generateAndSaveSignupCode(email);
            emailService.sendSignupCodeEmail(email, code);

            resp.setSuccess(true);
            resp.setMessage("가입용 인증 코드를 이메일로 발송했습니다.");
            return ResponseEntity.ok(resp);

        } catch (RuntimeException e) {
            resp.setSuccess(false);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);

        } catch (Exception e) {
            log.error("[AuthController] 인증코드 이메일 전송 실패 → {}", email, e);
            resp.setSuccess(false);
            resp.setMessage("인증 코드 발송 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(resp);
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<VerifyCodeResponse> verifyCodeForSignup(@RequestBody VerifyCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code  = request.getCode().trim();
        VerifyCodeResponse resp = new VerifyCodeResponse();

        try {
            boolean ok = userService.verifySignupCode(email, code);
            if (ok) {
                resp.setVerified(true);
                resp.setMessage("가입용 인증 코드가 일치합니다.");
                return ResponseEntity.ok(resp);
            } else {
                resp.setVerified(false);
                resp.setMessage("인증 코드가 일치하지 않거나 만료되었습니다.");
                return ResponseEntity.badRequest().body(resp);
            }
        } catch (RuntimeException e) {
            resp.setVerified(false);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody SignupRequest request) {
        SignupResponse resp = new SignupResponse();
        String email = request.getEmail().trim().toLowerCase();

        try {
            // 1) 회원가입 수행
            User newUser = userService.signup(request);

            // 2) 토큰 생성 시 ● 이메일과 Roles 목록( List<String> )을 넘겨준다
            String token = jwtTokenProvider.createToken(
                    newUser.getId(),
                    newUser.getEmail(),
                    newUser.getRoles()
            );

            // 3) 응답으로 토큰과 생성된 User 객체를 담아 리턴
            resp.setSuccess(true);
            resp.setUser(newUser);
            resp.setToken(token);
            return ResponseEntity.ok(resp);

        } catch (RuntimeException e) {
            resp.setSuccess(false);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.authenticate(request.getEmail(), request.getPassword());

            String token = jwtTokenProvider.createToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRoles()
            );

            System.out.println("유저 컨트롤러 : 로그인 메서드 - 토큰 발급 / 유저 아이디 : " + user.getId());

            return ResponseEntity.ok(new LoginResponse(user.getId(), token, user.getUserName()));

        } catch (UsernameNotFoundException ex) {
            return ResponseEntity.status(401).body(Map.of("message", ex.getMessage()));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }



    @PostMapping("/send-reset-code")
    public ResponseEntity<SendResetCodeResponse> sendResetCode(@RequestBody SendResetCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        SendResetCodeResponse resp = new SendResetCodeResponse();

        if (!userService.existsByEmail(email)) {
            resp.setSuccess(false);
            resp.setMessage("등록된 이메일이 아닙니다.");
            return ResponseEntity.badRequest().body(resp);
        }

        String code = userService.generateAndSaveResetCode(email);
        try {
            emailService.sendResetCodeEmail(email, code);
            resp.setSuccess(true);
            resp.setMessage("비밀번호 재설정용 인증 코드를 이메일로 발송했습니다.");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("[AuthController] 재설정용 인증 코드 이메일 전송 실패 → {}", email, e);
            resp.setSuccess(false);
            resp.setMessage("인증 코드 발송 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(resp);
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<VerifyResetCodeResponse> verifyResetCode(@RequestBody VerifyResetCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code  = request.getCode().trim();
        VerifyResetCodeResponse resp = new VerifyResetCodeResponse();

        try {
            boolean ok = userService.verifyResetCode(email, code);
            if (ok) {
                resp.setVerified(true);
                resp.setMessage("재설정용 인증 코드가 일치합니다.");
                return ResponseEntity.ok(resp);
            } else {
                resp.setVerified(false);
                resp.setMessage("인증 코드가 일치하지 않거나 만료되었습니다.");
                return ResponseEntity.badRequest().body(resp);
            }
        } catch (RuntimeException e) {
            resp.setVerified(false);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/reset-password-by-code")
    public ResponseEntity<ResetPasswordByCodeResponse> resetPasswordByCode(
            @RequestBody ResetPasswordByCodeRequest request) {
        String email       = request.getEmail().trim().toLowerCase();
        String code        = request.getCode().trim();
        String newPassword = request.getNewPassword();
        ResetPasswordByCodeResponse resp = new ResetPasswordByCodeResponse();

        try {
            boolean success = userService.resetPasswordWithCode(email, code, newPassword);
            if (success) {
                resp.setSuccess(true);
                resp.setMessage("비밀번호가 성공적으로 변경되었습니다.");
                return ResponseEntity.ok(resp);
            } else {
                resp.setSuccess(false);
                resp.setMessage("비밀번호 재설정에 실패했습니다.");
                return ResponseEntity.badRequest().body(resp);
            }
        } catch (RuntimeException e) {
            resp.setSuccess(false);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @GetMapping("/oauth/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestParam String code) {
        log.info("[AuthController.kakaoLogin] 진입 → code = {}", code);
        try {
            var result = userService.kakaoLoginAndGetUser(code);
            if (result.isRequiresConsent()) {
                return ResponseEntity.ok(Map.of(
                        "requiresConsent", true,
                        "email",          result.getUser().getEmail(),
                        "userName",       result.getUser().getUserName()
                ));
            }
            User user = result.getUser();
            // "카카오 로그인" 이후에도 createToken 호출 시 email과 roles 리스트를 넘겨준다
            String token = jwtTokenProvider.createToken(
                    result.getUser().getId(),
                    result.getUser().getEmail(),
                    result.getUser().getRoles()
            );
            return ResponseEntity.ok(Map.of(
                    "userId", user.getId(),
                    "accessToken", token,
                    "email",       result.getUser().getEmail(),
                    "userName",    result.getUser().getUserName()
            ));
        } catch (Exception e) {
            log.error("카카오 로그인 처리 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", "카카오 로그인 실패"));
        }
    }

    @GetMapping("/oauth/google")
    public ResponseEntity<?> googleLogin(@RequestParam String code) {
        try {
            var result = userService.googleLoginAndGetUser(code);
            if (result.isRequiresConsent()) {
                return ResponseEntity.ok(Map.of(
                        "requiresConsent", true,
                        "email",          result.getUser().getEmail(),
                        "userName",       result.getUser().getUserName()
                ));
            }
            User user=result.getUser();
            // "구글 로그인" 이후에도 createToken 호출 시 email과 roles 리스트를 넘겨준다
            String token = jwtTokenProvider.createToken(
                    result.getUser().getId(),
                    result.getUser().getEmail(),
                    result.getUser().getRoles()
            );
            return ResponseEntity.ok(Map.of(
                    "userId", user.getId(),
                    "accessToken", token,
                    "email",       result.getUser().getEmail(),
                    "userName",    result.getUser().getUserName()
            ));
        } catch (Exception e) {
            log.error("구글 로그인 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", "구글 로그인 실패"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<MyInfoResponse> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        MyInfoResponse resp = new MyInfoResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setUserName(user.getUserName());
        resp.setRoles(user.getRoles());
        resp.setPoint(user.getPoint());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/confirm-social")
    public ResponseEntity<ConfirmSocialResponse> confirmSocial(@RequestBody ConfirmSocialRequest request) {
        String email        = request.getEmail();
        String loginTypeStr = request.getLoginType();
        ConfirmSocialResponse resp = new ConfirmSocialResponse();

        User user = userService.findByEmail(email);
        if (user.getLoginType() != LoginType.LOCAL) {
            resp.setError("이미 소셜 로그인 계정입니다.");
            return ResponseEntity.badRequest().body(resp);
        }

        LoginType typeToUpdate;
        try {
            typeToUpdate = LoginType.valueOf(loginTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            resp.setError("유효하지 않은 로그인 타입입니다.");
            return ResponseEntity.badRequest().body(resp);
        }

        User updated = userService.confirmSocialLink(
                SocialUserInfo.builder()
                        .id(user.getSocialId())
                        .email(user.getEmail())
                        .name(user.getUserName())
                        .build(),
                typeToUpdate
        );

        // Social 연결 후에도 createToken 호출 시 email과 roles 리스트를 넘겨준다
        String token = jwtTokenProvider.createToken(
                updated.getId(),
                updated.getEmail(),
                updated.getRoles()
        );

        resp.setAccessToken(token);
        resp.setEmail(updated.getEmail());
        resp.setUserName(updated.getUserName());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/find-id")
    public ResponseEntity<FindIdResponse> findId(@RequestBody FindIdRequest request) {
        try {
            FindIdResponse response = userService.findIdByUserName(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/point/increase")
    public ResponseEntity<Void> increasePoint(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        int point = Integer.parseInt(request.get("point").toString());
        userService.addPoint(userId, point);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        Long userId = Long.valueOf(request.get("userId"));
        String userName = request.get("userName");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        try {
            userService.updateUserProfile(userId, userName, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "프로필이 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }



}
