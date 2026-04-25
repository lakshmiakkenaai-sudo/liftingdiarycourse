# Data Fetching

## Rule: Server Components Only

All data fetching in this app **must** be done exclusively via React Server Components.

**Never fetch data via:**
- Route handlers (`app/api/`)
- Client components (`"use client"`)
- Any other mechanism

This is a hard rule with no exceptions.

## Rule: Database Queries via `/data` Helpers

All database queries must go through helper functions located in the `/data` directory. These helpers must use **Drizzle ORM** — never raw SQL.

```
src/
  data/
    workouts.ts     # e.g. getWorkoutsForUser(userId)
    exercises.ts
    ...
```

A server component fetches data by calling a `/data` helper directly:

```tsx
// app/dashboard/page.tsx (Server Component)
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

## Rule: Users Can Only Access Their Own Data

Every `/data` helper that queries user-owned data **must** scope the query to the authenticated user's ID. This is not optional.

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

Never accept a `userId` from client-supplied input (query params, request body, etc.). Always derive `userId` from the authenticated session on the server.

## Summary

| Concern | Requirement |
|---|---|
| Where to fetch | Server Components only |
| How to query the DB | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| Route handler fetching | Never |
| Client component fetching | Never |
| Data access scope | Always filter by the authenticated user's ID |
