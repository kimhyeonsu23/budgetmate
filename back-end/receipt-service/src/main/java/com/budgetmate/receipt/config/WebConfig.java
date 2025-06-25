package com.budgetmate.receipt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;


@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resolvedPath = "file:" + (uploadPath.endsWith("/") ? uploadPath : uploadPath + "/");
        registry
                .addResourceHandler("/receipt/image/**")
                .addResourceLocations(resolvedPath);
    }
}
