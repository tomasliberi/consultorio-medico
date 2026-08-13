package com.consultorio.repository;

import com.consultorio.model.HistoriaClinica;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {

    Optional<HistoriaClinica> findByPacienteId(Long pacienteId);
}
