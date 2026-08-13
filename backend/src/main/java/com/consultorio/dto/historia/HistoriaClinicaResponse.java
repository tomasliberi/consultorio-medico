package com.consultorio.dto.historia;

public record HistoriaClinicaResponse(
        Long id,
        Long pacienteId,
        String antecedentes,
        String alergias,
        String medicacionHabitual,
        String enfermedadesPrevias,
        String observaciones
) {
}
