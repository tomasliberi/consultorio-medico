package com.consultorio.repository;
import com.consultorio.model.Cancelacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CancelacionRepository extends JpaRepository<Cancelacion, Long> {
    boolean existsByConsultaId(Long consultaId);
    List<Cancelacion> findByPacienteIdOrderByCanceladoEnDesc(Long pacienteId);
}
