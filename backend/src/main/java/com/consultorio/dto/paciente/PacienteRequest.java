package com.consultorio.dto.paciente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PacienteRequest(
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Size(max = 120) String apellido,
        @NotBlank @Size(max = 40) String dni,
        @Past LocalDate fechaNacimiento,
        @Size(max = 40) String telefono,
        @Email String email,
        @Size(max = 160) String obraSocial,
        @Size(max = 80) String numeroAfiliado,
        @Size(max = 5000) String observacionesGenerales
) {
}
