package com.consultorio.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
@Configuration public class WebConfig implements WebMvcConfigurer {
    private final AuditInterceptor audit;
    public WebConfig(AuditInterceptor audit){this.audit=audit;}
    @Override public void addInterceptors(InterceptorRegistry registry){registry.addInterceptor(audit).addPathPatterns("/**");}
}
