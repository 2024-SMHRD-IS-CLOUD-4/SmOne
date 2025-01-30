package com.smhrd.smone.model;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "XRAY_IMAGES")
public class XrayImages {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@JsonProperty("imgIdx")
	@Column(name = "IMG_IDX")
	private Integer imgIdx;
	
	@JsonProperty("pIdx")
	@Column(name = "P_IDX")
	private Integer pIdx; // 환자 식별자
	
	@JsonProperty("imgPath")
	@Column(name = "IMG_PATH", length = 1000)
	private String imgPath;
	
	@CreationTimestamp
	@Column(name = "UPLOADED_AT", updatable = false)
	private Timestamp uploadedAt;
	
	@Column(name = "PROCESSED_AT")
	private Timestamp processedAt; // 우선 null 허용
	
	@Column(name = "RESULT", length = 255)
	private String result; // 우선 null 허용
	
	@Column(name="BIG_XRAY", length=1000)
	private String bigXray;
	
}
