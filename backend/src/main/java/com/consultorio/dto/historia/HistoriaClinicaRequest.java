package com.consultorio.dto.historia;

public record HistoriaClinicaRequest(
        String antecedentes,
        String alergias,
        String medicacionHabitual,
        String enfermedadesPrevias,
        String observaciones
) {
}
