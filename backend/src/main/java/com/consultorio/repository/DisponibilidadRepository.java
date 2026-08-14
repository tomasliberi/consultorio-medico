package com.consultorio.repository;

import com.consultorio.model.Disponibilidad;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {
    List<Disponibilidad> findByActivoTrue();
    List<Disponibilidad> findByDiaSemanaAndActivoTrue(Disponibilidad.DiaSemana diaSemana);
}
