import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { format } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getWorkoutWithExercisesById } from "@/data/workouts"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId: workoutIdParam } = await params
  const workoutId = Number(workoutIdParam)

  if (!Number.isInteger(workoutId) || workoutId <= 0) notFound()

  const { userId } = await auth()
  if (!userId) notFound()

  const workout = await getWorkoutWithExercisesById(userId, workoutId)
  
  if (!workout) notFound()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{workout.title || "Workout"}</h1>
          {workout.startedAt && (
            <p className="text-muted-foreground">
              {format(workout.startedAt, "do MMM yyyy")}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href={`/dashboard/workout/${workoutId}`}>
            Edit Workout
          </Link>
        </Button>
      </div>

      {workout.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {workout.exercises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground">
            <p>No exercises in this workout.</p>
            <Button asChild>
              <Link href={`/dashboard/workout/${workoutId}`}>
                Add exercises
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {workout.exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
              </CardHeader>
              {exercise.sets.length > 0 && (
                <CardContent className="flex flex-col gap-2">
                  {exercise.sets.map((set) => (
                    <CardDescription key={set.id}>
                      Set {set.setNumber ?? "?"}
                      {set.reps != null ? ` — ${set.reps} reps` : ""}
                      {set.weight != null ? ` @ ${set.weight} kg` : ""}
                    </CardDescription>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}