package com.budgetmate.receipt.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/receipt/image")
public class ImageController {

    @Value("${file.upload-dir}")
    private String uploadDir;


    @PostMapping("/upload")
    public String uploadImage(@RequestParam("image") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("No file selected.");

        String filename = new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss").format(new Date()) + ".jpg";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        file.transferTo(new File(dir, filename));

        return filename;
    }


}
