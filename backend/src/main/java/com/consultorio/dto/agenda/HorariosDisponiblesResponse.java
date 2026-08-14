package com.consultorio.dto.agenda;

import java.time.LocalTime;
import java.util.List;

public record HorariosDisponiblesResponse(
    List<LocalTime> horariosDisponibles
) {}
