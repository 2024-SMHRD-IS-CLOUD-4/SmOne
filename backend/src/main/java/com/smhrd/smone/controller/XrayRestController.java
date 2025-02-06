package com.smhrd.smone.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.smone.model.XrayImages;
import com.smhrd.smone.repository.XrayImagesRepository;

import java.util.List;

@RestController
public class XrayRestController {

    private final XrayImagesRepository xrayImagesRepository;

    public XrayRestController(XrayImagesRepository xrayImagesRepository) {
        this.xrayImagesRepository = xrayImagesRepository;
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<XrayImages>> getXrayImages(@RequestParam("pIdx") Integer pIdx) {
        List<XrayImages> images = xrayImagesRepository.findBypIdx(pIdx);
        return ResponseEntity.ok(images);
    }
    
    @GetMapping("/dates")
    public ResponseEntity<List<String>> getDistinctDates(@RequestParam("pIdx") Integer pIdx) {
        List<String> dates = xrayImagesRepository.findDistinctDatesByPIdx(pIdx);
        return ResponseEntity.ok(dates);
    }
    
    @GetMapping("/images-by-date")
    public ResponseEntity<List<XrayImages>> getImagesByDate(
            @RequestParam("pIdx") Integer pIdx,
            @RequestParam("date") String dateStr) {
        List<XrayImages> images = xrayImagesRepository.findByPIdxAndDate(pIdx, dateStr);
        return ResponseEntity.ok(images);
    }
}