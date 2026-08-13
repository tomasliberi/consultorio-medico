package com.consultorio.repository;

import com.consultorio.model.Procedimiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcedimientoRepository extends JpaRepository<Procedimiento, Long> {

    List<Procedimiento> findByPacienteIdOrderByFechaDescIdDesc(Long pacienteId);
}
