package com.jardineria.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapea /img/** a la carpeta uploads/ en la raíz del proyecto
        registry.addResourceHandler("/img/**")
                .addResourceLocations("file:uploads/");
    }
}
