package com.smhrd.smone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.smone.mapper.UserMapper;
import com.smhrd.smone.model.User;

@Service
public class UserService {

	@Autowired
	private UserMapper mapper;
	
	public int signup(User user) {
		// TODO Auto-generated method stub
		return mapper.signup(user);
	}

	public User login(User user) {
		// TODO Auto-generated method stub
		return mapper.login(user);
	}

}
