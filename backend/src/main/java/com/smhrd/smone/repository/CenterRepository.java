package com.smhrd.smone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.smone.model.Center;

@Repository
public interface CenterRepository extends JpaRepository<Center, String> {

}
