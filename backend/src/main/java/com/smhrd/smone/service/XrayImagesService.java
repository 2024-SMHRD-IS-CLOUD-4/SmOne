package com.smhrd.smone.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

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

	@Value("${file.upload-dir}")
	private String uploadDir; // 예: C:\\XrayImages

	// 환자별 X-ray 목록
	public List<XrayImages> getXraysByPatient(Integer pIdx) {
		return xrayRepo.findBypIdx(pIdx);
	}

	// 새 X-RAY 업로드 AND DB insert(RESULT=null, PROCESSED_AT = NULL)
	public List<XrayImages> insertXrayImages(Integer pIdx, List<MultipartFile> files, String bigFilename)
			throws Exception {
		List<XrayImages> resultList = new ArrayList<>();
		for (MultipartFile mf : files) {
			if (mf.isEmpty())
				continue;

			// 1) 로컬 파일 저장
			String orig = mf.getOriginalFilename();
			String saveName = System.currentTimeMillis() + "_" + orig;
			Path dest = Paths.get(uploadDir + File.separator + saveName);
			Files.write(dest, mf.getBytes());

			// 2) DB insert
			XrayImages x = new XrayImages();
			x.setPIdx(pIdx);
			x.setImgPath(saveName);
			x.setProcessedAt(null);
			x.setResult(null);

			if (bigFilename != null && orig.equals(bigFilename)) {
				x.setBigXray(saveName);
			} else {
				x.setBigXray(null);
			}

			XrayImages saved = xrayRepo.save(x);
			resultList.add(saved);
		}
		return resultList;
	}

	// 해당 환자의 "연-월-일" 목록 (중복 없이, 최신순)
	public List<String> getDistinctDates(Integer pIdx) {
		return xrayRepo.findDistinctDatesByPIdx(pIdx);
	}

	// 특정 환자 + 특정 연-월-일 => 그 날짜의 X-ray 목록
	public List<XrayImages> getImagesByDate(Integer pIdx, String dateStr) {
		return xrayRepo.findByPIdxAndDate(pIdx, dateStr);
	}

	// X-ray 결과 업데이트 => RESULT, PROCESSED_AT = UPLOADED_AT+3초
	public void updateXrayResult(Integer imgIdx, String result) {
        XrayImages x = xrayRepo.findById(imgIdx)
            .orElseThrow(() -> new NoSuchElementException("해당 X-ray 없음. imgIdx="+imgIdx));

        x.setResult(result);

        // "처리 완료 시각"을 업로드시각 + 3초로 임시 세팅
        Timestamp uploaded = x.getUploadedAt();
        if(uploaded != null){
            long plus3s = uploaded.getTime() + 3000; // 3초후
            x.setProcessedAt(new Timestamp(plus3s));
        }

        xrayRepo.save(x);
    }
}