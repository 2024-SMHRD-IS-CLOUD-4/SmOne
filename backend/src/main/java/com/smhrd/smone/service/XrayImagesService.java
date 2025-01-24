package com.smhrd.smone.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.smone.model.XrayImages;
import com.smhrd.smone.repository.XrayImagesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class XrayImagesService {
	
	private final XrayImagesRepository xrayRepo;
	
	// "C:\\XrayImages"
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	// 특정 확잔 x-ray 목록 조회
	public List<XrayImages> getXraysByPatient(Integer pIdx) {
        return xrayRepo.findBypIdx(pIdx);
    }
	
	// 진다하기 버튼 클릭 -> 파일 업로드 => db에 result =null
	public List<XrayImages> insertXrayImages(Integer pIdx, MultipartFile[] files) throws Exception{
		List<XrayImages> savedList = new ArrayList<>();
		
		for (MultipartFile file : files) {
			if(file.isEmpty()) continue;
			
			 // 로컬 디스크에 저장
            String originalName = file.getOriginalFilename();
            String savedFileName = System.currentTimeMillis() + "_" + originalName;
            
            // 경로: "C:\\XrayImages\\{time}_{originalName}"
            Path targetPath = Paths.get(uploadDir + File.separator + savedFileName);
            Files.write(targetPath, file.getBytes());

            // DB에 insert
            XrayImages x = new XrayImages();
            x.setPIdx(pIdx);
            x.setImgPath(savedFileName);
            x.setProcessedAt(null);
            x.setResult(null);

            savedList.add(xrayRepo.save(x));
        }

        return savedList;
    }
}