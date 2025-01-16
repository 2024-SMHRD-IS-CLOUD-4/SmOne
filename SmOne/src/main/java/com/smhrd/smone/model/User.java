package com.smhrd.smone.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.sql.Timestamp;

@ToString
@Entity
@Getter
@Setter
@Data
@NoArgsConstructor
@Table(name = "USER")
public class User {

	@Id
    @Column(name = "USER_ID", length = 100, nullable = false)
    private String userId; 

    @Column(name = "CENTER_ID", length = 255, nullable = false)
    private String centerId; 

    @Column(name = "USER_PW", length = 255, nullable = false)
    private String userPw; 

    @Column(name = "USER_NAME", length = 255, nullable = false)
    private String userName; 

    @Column(name = "ROLE", length = 255, nullable = false)
    private String role;

    @Column(name = "EMAIL", length = 255, nullable = false)
    private String email;

    @JsonProperty("uAdd")
    @Column(name = "U_ADD", length = 255, nullable = false)
    private String uAdd;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private Timestamp createdAt;

}
