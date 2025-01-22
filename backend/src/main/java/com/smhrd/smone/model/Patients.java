package com.smhrd.smone.model;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.AllArgsConstructor;

@ToString
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PATIENTS")
public class Patients {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@JsonProperty("pIdx")
    @Column(name = "P_IDX")
    private Integer pIdx;

	@JsonProperty("pName")
    @Column(name = "P_NAME", nullable = false, length = 50)
    private String pName;

	@JsonProperty("pAdd")
    @Column(name = "P_ADD", nullable = false, length = 100)
    private String pAdd;

    @Column(name = "BIRTH", nullable = false, length = 50)
    private String birth;

    @Column(name = "GENDER", nullable = false, length = 10)
    private String gender;

    @Column(name = "TEL", nullable = false, length = 50)
    private String tel;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private Timestamp createdAt; 
}
