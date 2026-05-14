package com.example.demo.Services.impl;

import com.example.demo.Services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;
    public void sendEmail(String to, String subject, String body){
        try{
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,"utf-8");
            helper.setSubject(subject);
            helper.setText(body,true);
            helper.setTo(to);
            javaMailSender.send(mimeMessage);
        }catch (
                MailException | MessagingException e
        ){
            throw new MailSendException("Failed to send email");
        }
    }
}
