package com.budgetmate.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendSignupCodeEmail(String toEmail, String code) {
        log.info("[EmailService] 가입용 인증 코드 전송 시작 → {}", toEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[BudgetMate] 회원가입 인증 코드");
        message.setText(
                "안녕하세요.\n\n"
                        + "회원가입을 위해 아래 인증 코드를 입력해 주세요.\n"
                        + "인증 코드: " + code + "\n\n"
                        + "※ 이 코드는 발급 후 5분 동안만 유효합니다."
        );

        try {
            mailSender.send(message);
            log.info("[EmailService] 가입용 인증 코드 전송 완료 → {}", toEmail);
        } catch (MailException e) {
            log.error("[EmailService] 인증 코드 이메일 전송 실패: {}", e.getMessage(), e);
            throw new RuntimeException("인증 코드 이메일 전송 중 오류가 발생했습니다.");
        }
    }

    public void sendResetCodeEmail(String toEmail, String code) {
        log.info("[EmailService] 비밀번호 재설정 코드 전송 시작 → {}", toEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[BudgetMate] 비밀번호 재설정 인증 코드");
        message.setText(
                "안녕하세요.\n\n"
                        + "비밀번호 재설정을 요청하셨습니다.\n"
                        + "인증 코드: " + code + "\n\n"
                        + "※ 이 코드는 발급 후 5분 동안만 유효합니다.\n\n"
                        + "만약 비밀번호 재설정을 요청한 적이 없다면, 이 메일을 무시해주세요."
        );

        try {
            mailSender.send(message);
            log.info("[EmailService] 비밀번호 재설정 코드 전송 완료 → {}", toEmail);
        } catch (MailException e) {
            log.error("[EmailService] 인증 코드 이메일 전송 실패: {}", e.getMessage(), e);
            throw new RuntimeException("인증 코드 이메일 전송 중 오류가 발생했습니다.");
        }
    }
}
