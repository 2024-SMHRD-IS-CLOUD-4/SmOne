package com.smhrd.smone.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name="HOSPITAL_INFO")
public class HospitalInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="HOS_IDX")
	private Integer hosIdx;
	
	@Column(name="HOS_NAME", length=100)
	private String hosName;
	
	@Column(name="HOS_ADD", length=255)
	private String hosAdd;
	
	@Column(name="HOS_TEL", length=50)
	private String hosTel;
	
    @Column(name="SPECIALIZATION", length=100)
    private String specialization;

    @Column(name="REGION", length=100)
    private String region;
	
    @Column(name="LAT")
    private Double lat; // 병원 위도
    
    @Column(name="LNG")
    private Double lng; // 병원 경도
    
    
}
