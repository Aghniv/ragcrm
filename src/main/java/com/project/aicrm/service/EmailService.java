package com.project.aicrm.service;

import com.project.aicrm.entity.Lead;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendLeadNotification(Lead lead) {
        if (mailSender == null) {
            System.out.println("Email service not configured - skipping notification to: " + lead.getEmail());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(lead.getEmail());
            message.setSubject("Thank you for your interest!");
            message.setText("Hi " + lead.getName() + ",\n\nThank you for reaching out. We will be in touch soon.\n\nBest regards,\nSales Team");
            message.setFrom("YOUR_GMAIL@gmail.com");

            mailSender.send(message);
            System.out.println("Email sent to: " + lead.getEmail());
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }

    public void sendFollowUp(Lead lead, String customMessage) {
        if (mailSender == null) {
            System.out.println("Email service not configured - skipping follow-up to: " + lead.getEmail());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(lead.getEmail());
            message.setSubject("Following up on your inquiry");
            message.setText("Hi " + lead.getName() + ",\n\n" + customMessage + "\n\nBest regards,\nSales Team");
            message.setFrom("YOUR_GMAIL@gmail.com");

            mailSender.send(message);
            System.out.println("Follow-up email sent to: " + lead.getEmail());
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }

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
            message.setFrom("paulaghniv@gmail.com");

            mailSender.send(message);
            System.out.println("Password reset email sent to: " + email);
        } catch (Exception e) {
            System.err.println("Error sending password reset email: " + e.getMessage());
        }
    }
}