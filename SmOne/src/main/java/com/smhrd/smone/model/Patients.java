package com.smhrd.smone.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.AllArgsConstructor;

@ToString

@Entity
@Table(name = "PATIENTS") // 정확한 테이블 이름 지정
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patients {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "P_IDX") // 테이블의 P_IDX 컬럼 매핑
    private int pIdx; // 기본 키

    @Column(name = "P_NAME", nullable = false, length = 50)
    @JsonProperty("pName") // JSON 데이터 키와 매핑
    private String pName; // 환자 이름

    @Column(name = "ADDRESS", length = 100)
    @JsonProperty("address") // JSON 데이터 키와 매핑
    private String address; // 주소

    @Column(name = "BIRTH", nullable = false, length = 50)
    @JsonProperty("birth") // JSON 데이터 키와 매핑
    private String birth; // 생년월일

    @Column(name = "GENDER", length = 10)
    @JsonProperty("gender") // JSON 데이터 키와 매핑
    private String gender; // 성별

    @Column(name = "TEL", length = 50)
    @JsonProperty("tel") // JSON 데이터 키와 매핑
    private String tel; // 전화번호

    @Column(name = "CREATED_AT", updatable = false, insertable = false)
    private java.sql.Timestamp createdAt; // 생성 시간
}
