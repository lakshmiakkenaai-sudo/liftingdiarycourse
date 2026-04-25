"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

export function CalendarPicker({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter()

  function handleSelect(date: Date | undefined) {
    if (!date) return
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    router.push(`?date=${iso}`)
  }

  return (
    <Card className="w-fit shrink-0">
      <CardContent className="pt-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </CardContent>
    </Card>
  )
}
