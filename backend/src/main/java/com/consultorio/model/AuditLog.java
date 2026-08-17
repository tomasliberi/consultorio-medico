package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=80) private String username;
    @Column(nullable=false,length=10) private String method;
    @Column(nullable=false,length=500) private String path;
    @Column(nullable=false) private Integer status;
    @Column(nullable=false,length=64) private String remoteAddress;
    @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    @PrePersist void create(){createdAt=LocalDateTime.now();}
    public void setUsername(String v){username=v;} public void setMethod(String v){method=v;}
    public void setPath(String v){path=v;} public void setStatus(Integer v){status=v;}
    public void setRemoteAddress(String v){remoteAddress=v;}
}
