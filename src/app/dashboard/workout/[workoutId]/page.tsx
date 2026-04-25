import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkoutWithExercisesById } from "@/data/workouts"
import { getExercises } from "@/data/exercises"
import { EditWorkoutForm } from "./edit-workout-form"

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId: workoutIdParam } = await params
  const workoutId = Number(workoutIdParam)

  if (!Number.isInteger(workoutId) || workoutId <= 0) notFound()

  const { userId } = await auth()
  if (!userId) notFound()

  const [workout, exercises] = await Promise.all([
    getWorkoutWithExercisesById(userId, workoutId),
    getExercises(),
  ])

  if (!workout) notFound()

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Edit Workout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm workout={workout} exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  )
}
