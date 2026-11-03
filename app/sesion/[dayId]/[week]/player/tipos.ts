import type { EtapaRacha } from "../../../../../lib/streak";

export type Fase = "intro" | "ejercicio" | "descanso" | "fin";

export type Registro = {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  kg: number;
  reps: number;
};

export type Evolucion = {
  desde: EtapaRacha;
  hasta: EtapaRacha;
  dias: number;
};

export type Resumen = {
  duracion: number;
  aviso: boolean;
  racha: number | null;
  evolucion: Evolucion | null;
};