package com.consultorio.dto.paciente;

import java.time.LocalDate;

public record PacienteResponse(
        Long id,
        String numeroHistoriaClinica,
        String nombre,
        String apellido,
        String dni,
        LocalDate fechaNacimiento,
        Integer edad,
        String telefono,
        String email,
        String obraSocial,
        String numeroAfiliado,
        String observacionesGenerales
) {
}
