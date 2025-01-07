package com.smhrd.smone.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

	private String userId;
	private String userPw;
	private String userName;
	private String role;
	private String email;
	private String createdAt;
}
