package com.smhrd.smone.model;


import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="DIAGNOSIS_RESULT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class DiagnosisResult {

	// PK
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name= "RESULT_IDX")
	private Integer resultIdx;
	
	@Column(name="IMG_IDX")
	private Integer imgIdx;
	
	@Column(name="DIAGNOSIS", length=255)
	private String diagnosis;
	
	// 외사 (사용자) ID
	@Column(name="DOCTOR_ID", length=100)
	private String doctorId;
	
	@Column(name="HOS_IDX")
	private Integer hosIdx;
	
	@CreationTimestamp
	@Column(name="DIAGNOSED_AT", updatable = false)
	private Timestamp diagnosedAt;
	
	// 환자 - 외래키
	@JsonProperty("pIdx")
	@Column(name="P_IDX")
	private Integer pIdx;
}
