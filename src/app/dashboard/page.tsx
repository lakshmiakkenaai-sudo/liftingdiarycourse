"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Bench Press",
    sets: 3,
    reps: 8,
    weight: 80,
  },
  {
    id: 2,
    name: "Squat",
    sets: 4,
    reps: 5,
    weight: 120,
  },
  {
    id: 3,
    name: "Deadlift",
    sets: 3,
    reps: 5,
    weight: 140,
  },
]

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Dashboard</h1>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <Card className="w-fit shrink-0">
          <CardContent className="pt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </CardContent>
        </Card>

        <div className="flex-1">
          <h2 className="mb-4 text-lg font-medium">
            Workouts for{" "}
            <span className="text-muted-foreground">
              {format(selectedDate, "do MMM yyyy")}
            </span>
          </h2>

          {MOCK_WORKOUTS.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No workouts logged for this day.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {MOCK_WORKOUTS.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <CardTitle>{workout.name}</CardTitle>
                    <CardDescription>
                      {workout.sets} sets × {workout.reps} reps @ {workout.weight} kg
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
