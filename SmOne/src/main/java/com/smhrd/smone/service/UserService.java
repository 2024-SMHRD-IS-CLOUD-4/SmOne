package com.smhrd.smone.service;

import com.smhrd.smone.model.User;
import com.smhrd.smone.repository.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

	@Autowired
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    
    public UserService(UserRepository userRepository, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    // 회원가입
    public User registerUser(User user) {
        return userRepository.save(user);
    }

    // 아이디 중복 체크
    public boolean isUserIdDuplicate(String userId) {
        return userRepository.existsById(userId);
    }

    // 로그인
    public User findUserById(String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    // 아이디 찾기
    public String findUserId(String centerId, String userName, String role, String email) {
        Optional<User> userOptional = userRepository.findByCenterIdAndUserNameAndRoleAndEmail(centerId, userName, role, email);
        return userOptional.map(User::getUserId).orElse(null);
    }


    // 비밀번호 변경
    public boolean changePassword(String userId, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setUserPw(newPassword); // 새로운 비밀번호 설정
            userRepository.save(user); // 변경 사항 저장
            return true;
        }
        return false; // 해당 아이디가 없을 경우
    }

    // 인증번호 이메일 전송
    public String sendVerificationEmail(String userId, String email) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent() && userOptional.get().getEmail().equals(email)) {
            String verificationCode = generateVerificationCode();
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setSubject("비밀번호 변경 인증번호");
                helper.setTo(email);
                helper.setText("인증번호는 다음과 같습니다: " + verificationCode);
                mailSender.send(message);
                return verificationCode;
            } catch (MessagingException e) {
                e.printStackTrace();
                throw new RuntimeException("이메일 전송 중 오류가 발생했습니다.");
            }
        }
        throw new IllegalArgumentException("아이디와 이메일 정보가 일치하지 않습니다.");
    }


    // 인증번호 생성
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 난수 생성
        return String.valueOf(code);
    }
}

