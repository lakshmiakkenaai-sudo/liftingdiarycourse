"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createWorkoutAction } from "./actions"
import type { Exercise } from "@/db/schema"

type SetEntry = { reps: string; weight: string }
type ExerciseEntry = { exerciseId: number; sets: SetEntry[] }

function emptySet(): SetEntry {
  return { reps: "", weight: "" }
}

export function NewWorkoutForm({
  defaultDate,
  exercises,
}: {
  defaultDate: Date
  exercises: Exercise[]
}) {
  const [pending, setPending] = useState(false)
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([])

  function addExercise(exerciseId: string) {
    setExerciseEntries((prev) => [
      ...prev,
      { exerciseId: Number(exerciseId), sets: [emptySet()] },
    ])
  }

  function removeExercise(index: number) {
    setExerciseEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function addSet(exerciseIndex: number) {
    setExerciseEntries((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex ? { ...e, sets: [...e.sets, emptySet()] } : e,
      ),
    )
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExerciseEntries((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: e.sets.filter((_, j) => j !== setIndex) }
          : e,
      ),
    )
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: keyof SetEntry, value: string) {
    setExerciseEntries((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? {
              ...e,
              sets: e.sets.map((s, j) =>
                j === setIndex ? { ...s, [field]: value } : s,
              ),
            }
          : e,
      ),
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)

    const dateStr = fd.get("startedAt") as string
    const [year, month, day] = dateStr.split("-").map(Number)

    await createWorkoutAction({
      title: (fd.get("title") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      startedAt: new Date(year, month - 1, day),
      exercises: exerciseEntries.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({
          reps: s.reps ? Number(s.reps) : undefined,
          weight: s.weight ? Number(s.weight) : undefined,
        })),
      })),
    })
  }

  const addedExerciseIds = new Set(exerciseEntries.map((e) => e.exerciseId))
  const availableExercises = exercises.filter((ex) => !addedExerciseIds.has(ex.id))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Push Day" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startedAt">Date</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="date"
          defaultValue={format(defaultDate, "yyyy-MM-dd")}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any notes about this workout…"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Exercises</Label>

        {exerciseEntries.map((entry, exerciseIndex) => {
          const exercise = exercises.find((ex) => ex.id === entry.exerciseId)!
          return (
            <Card key={entry.exerciseId}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{exercise.name}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(exerciseIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-8" />
                  <span>Reps</span>
                  <span>Weight (kg)</span>
                  <span className="w-8" />
                </div>

                {entry.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                    <span className="w-8 text-sm text-muted-foreground">
                      {setIndex + 1}
                    </span>
                    <Input
                      type="number"
                      min={1}
                      placeholder="—"
                      value={set.reps}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", e.target.value)}
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      placeholder="—"
                      value={set.weight}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={entry.sets.length === 1}
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => addSet(exerciseIndex)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add set
                </Button>
              </CardContent>
            </Card>
          )
        })}

        {availableExercises.length > 0 && (
          <Select onValueChange={addExercise}>
            <SelectTrigger>
              <SelectValue placeholder="+ Add exercise" />
            </SelectTrigger>
            <SelectContent>
              {availableExercises.map((ex) => (
                <SelectItem key={ex.id} value={String(ex.id)}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create Workout"}
      </Button>
    </form>
  )
}
