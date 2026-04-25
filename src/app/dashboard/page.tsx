import { auth } from "@clerk/nextjs/server"
import { format } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getWorkoutsForUserOnDate } from "@/data/workouts"
import { CalendarPicker } from "./calendar-picker"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { userId } = await auth()
  const { date: dateParam } = await searchParams

  const selectedDate = dateParam
    ? (() => {
        const [year, month, day] = dateParam.split("-").map(Number)
        return new Date(year, month - 1, day)
      })()
    : new Date()
  const workouts = await getWorkoutsForUserOnDate(userId!, selectedDate)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Dashboard</h1>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <CalendarPicker selectedDate={selectedDate} />

        <div className="flex-1">
          <h2 className="mb-4 text-lg font-medium">
            Workouts for{" "}
            <span className="text-muted-foreground">
              {format(selectedDate, "do MMM yyyy")}
            </span>
          </h2>

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground">
                <p>No workouts logged for this day.</p>
                <Button asChild>
                  <Link href={`/dashboard/workout/new?date=${format(selectedDate, "yyyy-MM-dd")}`}>
                    Log new workout
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <CardTitle>{workout.title ?? "Workout"}</CardTitle>
                  </CardHeader>
                  {workout.exercises.length > 0 && (
                    <CardContent className="flex flex-col gap-2">
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id}>
                          <p className="font-medium">{exercise.name}</p>
                          {exercise.sets.length > 0 && (
                            <div className="mt-1 flex flex-col gap-1">
                              {exercise.sets.map((set) => (
                                <CardDescription key={set.id}>
                                  Set {set.setNumber ?? "?"}
                                  {set.reps != null ? ` — ${set.reps} reps` : ""}
                                  {set.weight != null ? ` @ ${set.weight} kg` : ""}
                                </CardDescription>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
