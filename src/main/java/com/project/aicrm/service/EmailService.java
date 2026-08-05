package com.project.aicrm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@aicrm.local}")
    private String fromAddress;

    @Value("${app.mail.reply-to:support@aicrm.local}")
    private String replyToAddress;

    public void sendPasswordResetEmail(String email, String resetToken) {
        if (mailSender == null) {
            System.out.println("Email service not configured - skipping password reset to: " + email);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset - AI CRM");
            message.setText("You requested a password reset.\n\n" +
                    "Use the following token to reset your password: " + resetToken + "\n\n" +
                    "This token will expire in 1 hour.\n\n" +
                    "If you didn't request this, please ignore this email.\n\nBest regards,\nAI CRM Team");
            message.setFrom(fromAddress);
            message.setReplyTo(replyToAddress);

            mailSender.send(message);
            System.out.println("Password reset email sent to: " + email);
        } catch (Exception e) {
            System.err.println("Error sending password reset email: " + e.getMessage());
        }
    }
}
