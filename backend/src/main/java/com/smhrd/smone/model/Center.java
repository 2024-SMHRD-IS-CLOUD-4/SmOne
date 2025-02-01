package com.smhrd.smone.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="CENTER")
public class Center {

	@Id
	@Column(name="CENTER_ID", length = 255, nullable = false)
	private String centerId;
	
	@Column(name="CENTER_ADD", length = 500)
	private String centerAdd;
}
