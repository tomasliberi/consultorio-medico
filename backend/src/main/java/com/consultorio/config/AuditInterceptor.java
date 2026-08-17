package com.consultorio.config;
import com.consultorio.model.AuditLog;
import com.consultorio.repository.AuditLogRepository;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuditInterceptor implements HandlerInterceptor {
    private final AuditLogRepository repository;
    public AuditInterceptor(AuditLogRepository repository){this.repository=repository;}
    @Override public void afterCompletion(HttpServletRequest req,HttpServletResponse res,Object handler,Exception ex){
        if(!java.util.Set.of("POST","PUT","DELETE","PATCH").contains(req.getMethod()) || req.getRequestURI().endsWith("/auth/login")) return;
        AuditLog log=new AuditLog(); log.setUsername(req.getUserPrincipal()==null?"anonymous":req.getUserPrincipal().getName());
        log.setMethod(req.getMethod()); log.setPath(req.getRequestURI()); log.setStatus(res.getStatus()); log.setRemoteAddress(req.getRemoteAddr());
        repository.save(log);
    }
}
