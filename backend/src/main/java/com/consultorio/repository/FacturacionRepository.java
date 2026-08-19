package com.consultorio.repository;

import com.consultorio.model.Facturacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturacionRepository extends JpaRepository<Facturacion, Long> {
    List<Facturacion> findAllByOrderByFechaDescIdDesc();
}
