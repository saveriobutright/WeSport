package com.saverio.wesportbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootApplication
public class WesportBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(WesportBackendApplication.class, args);
    }
    @Bean
    CommandLineRunner logMappings(RequestMappingHandlerMapping mapping) {
        return args -> mapping.getHandlerMethods().forEach((info, method) ->
                System.out.println("MAPPING: " + info));
    }
}
