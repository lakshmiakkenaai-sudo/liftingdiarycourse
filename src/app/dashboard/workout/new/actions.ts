"use server"

import { createWorkoutWithExercises } from "@/data/workouts"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const SetSchema = z.object({
  reps: z.coerce.number().int().positive().optional(),
  weight: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
})

const ExerciseEntrySchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.array(SetSchema),
})

const CreateWorkoutSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.coerce.date(),
  exercises: z.array(ExerciseEntrySchema),
})

type SetInput = { reps?: number; weight?: number; notes?: string }
type ExerciseEntry = { exerciseId: number; sets: SetInput[] }

export async function createWorkoutAction(params: {
  title?: string
  notes?: string
  startedAt: Date
  exercises: ExerciseEntry[]
}) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) throw new Error("Invalid input")

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const workout = await createWorkoutWithExercises(
    userId,
    parsed.data.title ?? null,
    parsed.data.notes ?? null,
    parsed.data.startedAt,
    parsed.data.exercises,
  )

  redirect(`/dashboard?date=${workout.startedAt.toISOString().split("T")[0]}`)
}
