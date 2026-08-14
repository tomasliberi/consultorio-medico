package com.consultorio.dto.paciente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;

public record PacienteRequest(
        @NotBlank String nombre,
        @NotBlank String apellido,
        @NotBlank String dni,
        @Past LocalDate fechaNacimiento,
        String telefono,
        @Email String email,
        String obraSocial,
        String numeroAfiliado,
        String observacionesGenerales
) {
}
