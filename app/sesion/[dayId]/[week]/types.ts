export type SessionExercise = {
  exerciseId: string;
  slug: string;
  name: string;
  equipment: string;
  instructions: string[];
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  timed: boolean;
  lastWeightKg: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
};

export type SessionInfo = {
  routineId: string;
  routineName: string;
  dayId: string;
  dayName: string;
  dayNumber: number;
  week: number;
  totalWeeks: number;
  exercises: SessionExercise[];
};