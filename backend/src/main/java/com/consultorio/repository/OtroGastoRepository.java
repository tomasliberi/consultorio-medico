package com.consultorio.repository;
import com.consultorio.model.OtroGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OtroGastoRepository extends JpaRepository<OtroGasto,Long>{ List<OtroGasto> findAllByOrderByFechaDescIdDesc(); }
