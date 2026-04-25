import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getExercises } from "@/data/exercises"
import { NewWorkoutForm } from "./new-workout-form"

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams

  const defaultDate = dateParam
    ? (() => {
        const [year, month, day] = dateParam.split("-").map(Number)
        return new Date(year, month - 1, day)
      })()
    : new Date()

  const exercises = await getExercises()

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">New Workout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewWorkoutForm defaultDate={defaultDate} exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  )
}
