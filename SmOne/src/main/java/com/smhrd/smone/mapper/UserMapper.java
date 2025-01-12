package com.smhrd.smone.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import com.smhrd.smone.model.User;

@Mapper
public interface UserMapper {

    // 회원가입
    @Insert("INSERT INTO USER (USER_ID, USER_PW, USER_NAME, ROLE, EMAIL) VALUES (#{userId}, #{userPw}, #{userName}, #{role}, #{email})")
    public int signup(User user);

    // 로그인
    @Select("SELECT * FROM USER WHERE USER_ID = #{userId} AND USER_PW = #{userPw}")
    public User login(User user);

    // 아이디 중복 확인
    @Select("SELECT * FROM USER WHERE USER_ID = #{userId}")
    public User findByUserId(String userId);
}
