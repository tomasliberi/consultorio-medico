package com.consultorio.repository;

import com.consultorio.model.Consulta;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByPacienteIdOrderByFechaDescIdDesc(Long pacienteId);

    List<Consulta> findByFechaBetweenOrderByFechaDescHoraDesc(LocalDate fechaInicio, LocalDate fechaFin);

    List<Consulta> findByFechaOrderByHoraAsc(LocalDate fecha);
}
