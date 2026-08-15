package com.consultorio.dto.paciente;

import java.time.LocalDate;
import java.time.LocalTime;

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
        String observacionesGenerales,
        String antecedentes,
        String alergias,
        String medicacionHabitual,
        LocalDate proximaCitaFecha,
        LocalTime proximaCitaHora
) {
}
