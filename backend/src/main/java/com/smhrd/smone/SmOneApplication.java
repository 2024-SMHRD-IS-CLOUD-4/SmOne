package com.smhrd.smone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.smhrd.smone")
public class SmOneApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmOneApplication.class, args);
	}

}
