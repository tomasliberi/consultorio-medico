package com.consultorio.service;
import com.consultorio.model.OtroGasto; import com.consultorio.repository.OtroGastoRepository; import org.springframework.stereotype.Service; import java.util.List;
@Service public class OtroGastoService { private final OtroGastoRepository repo; public OtroGastoService(OtroGastoRepository r){repo=r;} public List<OtroGasto> listar(){return repo.findAllByOrderByFechaDescIdDesc();} public OtroGasto crear(OtroGasto g){return repo.save(g);} }
