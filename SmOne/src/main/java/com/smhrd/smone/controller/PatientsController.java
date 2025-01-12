package com.smhrd.smone.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smhrd.smone.model.Patients;
import com.smhrd.smone.service.PatientsService;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/patients")
public class PatientsController {

    @Autowired
    private PatientsService patientsService;

    // 환자 등록 API
    @PostMapping
    public ResponseEntity<Patients> savePatient(@RequestBody Patients patient) {
        Patients savedPatient = patientsService.savePatient(patient);
        return ResponseEntity.ok(savedPatient);
    }

    // 생년월일 앞부분으로 환자 검색
    @GetMapping("/{birth}")
    public ResponseEntity<List<Patients>> findPatientByPartialBirth(@PathVariable String birth) {
    	 List<Patients> patients = patientsService.findPatientByPartialBirth(birth);
        if (!patients.isEmpty()) {
            return ResponseEntity.ok(patients);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}