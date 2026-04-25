import { db } from "@/db"
import { exercises } from "@/db/schema"

export async function getExercises() {
  return db.select().from(exercises).orderBy(exercises.name)
}
