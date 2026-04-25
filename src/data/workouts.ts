import { db } from "@/db"
import { workouts, workoutExercises, exercises, sets } from "@/db/schema"
import { eq, and, gte, lt } from "drizzle-orm"

export async function getWorkoutWithExercisesById(userId: string, workoutId: number) {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutTitle: workouts.title,
      workoutNotes: workouts.notes,
      workoutStartedAt: workouts.startedAt,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      workoutExerciseId: workoutExercises.id,
      workoutExerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber)

  if (rows.length === 0) return null

  const first = rows[0]
  const exerciseMap = new Map<
    number,
    { id: number; exerciseId: number; name: string; sets: { id: number; setNumber: number; reps: number | null; weight: string | null }[] }
  >()

  for (const row of rows) {
    if (row.workoutExerciseId && row.exerciseId && row.exerciseName) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        exerciseMap.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          exerciseId: row.exerciseId,
          name: row.exerciseName,
          sets: [],
        })
      }
      if (row.setId) {
        exerciseMap.get(row.workoutExerciseId)!.sets.push({
          id: row.setId,
          setNumber: row.setNumber ?? 0,
          reps: row.reps,
          weight: row.weight,
        })
      }
    }
  }

  return {
    id: first.workoutId,
    title: first.workoutTitle,
    notes: first.workoutNotes,
    startedAt: first.workoutStartedAt,
    exercises: Array.from(exerciseMap.values()),
  }
}

export async function updateWorkoutWithExercises(
  userId: string,
  workoutId: number,
  title: string | null,
  notes: string | null,
  startedAt: Date,
  exerciseInputs: ExerciseInput[],
) {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(workouts)
      .set({ title, notes, startedAt })
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
      .returning()

    if (!updated) throw new Error("Workout not found or access denied")

    // Delete existing exercises (cascades to sets)
    await tx.delete(workoutExercises).where(eq(workoutExercises.workoutId, workoutId))

    for (let i = 0; i < exerciseInputs.length; i++) {
      const { exerciseId, sets: setInputs } = exerciseInputs[i]
      const [we] = await tx
        .insert(workoutExercises)
        .values({ workoutId, exerciseId, order: i })
        .returning()

      if (setInputs.length > 0) {
        await tx.insert(sets).values(
          setInputs.map((s, idx) => ({
            workoutExerciseId: we.id,
            setNumber: idx + 1,
            reps: s.reps ?? null,
            weight: s.weight != null ? String(s.weight) : null,
            notes: s.notes ?? null,
          })),
        )
      }
    }

    return updated
  })
}

export async function createWorkout(userId: string, title: string | null, notes: string | null, startedAt: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, title, notes, startedAt })
    .returning()
  return workout
}

type SetInput = { reps?: number; weight?: number; notes?: string }
type ExerciseInput = { exerciseId: number; sets: SetInput[] }

export async function createWorkoutWithExercises(
  userId: string,
  title: string | null,
  notes: string | null,
  startedAt: Date,
  exerciseInputs: ExerciseInput[],
) {
  return db.transaction(async (tx) => {
    const [workout] = await tx
      .insert(workouts)
      .values({ userId, title, notes, startedAt })
      .returning()

    for (let i = 0; i < exerciseInputs.length; i++) {
      const { exerciseId, sets: setInputs } = exerciseInputs[i]

      const [we] = await tx
        .insert(workoutExercises)
        .values({ workoutId: workout.id, exerciseId, order: i })
        .returning()

      if (setInputs.length > 0) {
        await tx.insert(sets).values(
          setInputs.map((s, idx) => ({
            workoutExerciseId: we.id,
            setNumber: idx + 1,
            reps: s.reps ?? null,
            weight: s.weight != null ? String(s.weight) : null,
            notes: s.notes ?? null,
          })),
        )
      }
    }

    return workout
  })
}

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutTitle: workouts.title,
      workoutStartedAt: workouts.startedAt,
      exerciseName: exercises.name,
      workoutExerciseId: workoutExercises.id,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    )
    .orderBy(workouts.id, workoutExercises.order, sets.setNumber)

  // Group rows into structured workouts
  const workoutMap = new Map<
    number,
    {
      id: number
      title: string | null
      startedAt: Date
      exercises: Map<
        number,
        {
          id: number
          name: string
          sets: { id: number; setNumber: number | null; reps: number | null; weight: string | null }[]
        }
      >
    }
  >()

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        title: row.workoutTitle,
        startedAt: row.workoutStartedAt,
        exercises: new Map(),
      })
    }

    const workout = workoutMap.get(row.workoutId)!

    if (row.workoutExerciseId && row.exerciseName) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          name: row.exerciseName,
          sets: [],
        })
      }

      if (row.setId) {
        workout.exercises.get(row.workoutExerciseId)!.sets.push({
          id: row.setId,
          setNumber: row.setNumber,
          reps: row.reps,
          weight: row.weight,
        })
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()),
  }))
}
