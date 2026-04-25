# Data Mutations

## Rule: Mutations via Server Actions Only

All data mutations in this app **must** be done exclusively via Next.js Server Actions.

**Never mutate data via:**
- Route handlers (`app/api/`)
- Client components directly calling the database
- Any other mechanism

This is a hard rule with no exceptions.

## Rule: Server Actions in Colocated `actions.ts` Files

Server actions must live in `actions.ts` files colocated with the route or feature they serve.

```
src/
  app/
    dashboard/
      actions.ts    # server actions for the dashboard route
    workouts/
      actions.ts    # server actions for the workouts route
      page.tsx
```

Do not put server actions in a shared global file or inside component files.

## Rule: Database Writes via `/data` Helpers

All database writes must go through helper functions in `src/data/`. These helpers must use **Drizzle ORM** — never raw SQL.

Server actions must **not** call Drizzle directly. They call a `/data` helper, which owns the DB interaction.

```
src/
  data/
    workouts.ts     # e.g. createWorkout(), deleteWorkout()
    exercises.ts
    ...
```

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}
```

```ts
// src/app/workouts/actions.ts
"use server";

import { createWorkout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return createWorkout(userId, parsed.data.name, parsed.data.date);
}
```

## Rule: All Server Action Parameters Must Be Typed

Every server action must have explicit TypeScript types for all parameters. The `FormData` type is **not allowed** as a parameter type — parse form inputs into typed objects before passing them in, or define a plain object parameter type.

```ts
// WRONG — FormData is not allowed
export async function createWorkoutAction(data: FormData) { ... }

// CORRECT — typed parameter object
export async function createWorkoutAction(params: { name: string; date: Date }) { ... }
```

## Rule: All Server Actions Must Validate Arguments with Zod

Every server action must validate its arguments using a Zod schema before doing anything else. Do not trust the caller.

```ts
const Schema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  const parsed = Schema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");
  // proceed with parsed.data
}
```

## Rule: Users Can Only Mutate Their Own Data

Every server action that writes user-owned data must derive `userId` from the authenticated session — never from caller-supplied input.

```ts
// WRONG — userId from caller
export async function deleteWorkoutAction(params: { userId: string; workoutId: string }) { ... }

// CORRECT — userId from session
export async function deleteWorkoutAction(params: { workoutId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return deleteWorkout(userId, params.workoutId);
}
```

The `/data` helper must also scope the write to the authenticated `userId` to prevent cross-user mutations.

## Summary

| Concern | Requirement |
|---|---|
| Where to mutate | Server Actions only |
| Where server actions live | Colocated `actions.ts` files |
| How to write to the DB | Drizzle ORM via `src/data/` helpers |
| Raw SQL | Never |
| Route handler mutations | Never |
| Server action parameter types | Always explicit — `FormData` is not allowed |
| Argument validation | Always via Zod |
| User identity | Always from the authenticated session, never from caller input |
