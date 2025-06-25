package com.budgetmate.receipt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;


//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//
//    @Value("${file.upload-dir}")
//    private String uploadPath;
//
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        String resolvedPath = "file:" + (uploadPath.endsWith("/") ? uploadPath : uploadPath + "/");
//        registry
//                .addResourceHandler("/receipt/image/**")
//                .addResourceLocations(resolvedPath);
//    }
//}
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String uploadPath = "file:/upload/image/"; // 절대경로 + file: 접두사

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/receipt/image/**")
                .addResourceLocations(uploadPath);
    }
}
