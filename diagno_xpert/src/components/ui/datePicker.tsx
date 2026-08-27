"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatToISO(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toISOString().split('T')[0]
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface Calendar28Props {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  hasError?: boolean;
  inputClassName?: string;
  placeholder?: string;
}

export function Calendar28({
  id,
  value: externalValue = "",
  onChange,
  onBlur,
  hasError,
  inputClassName = "",
  placeholder = "Select date",
}: Calendar28Props) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    externalValue ? new Date(externalValue) : undefined
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [inputValue, setInputValue] = React.useState(
    externalValue ? formatDate(new Date(externalValue)) : ""
  )

  // Update internal state when external value changes
  React.useEffect(() => {
    if (externalValue) {
      const newDate = new Date(externalValue)
      if (isValidDate(newDate)) {
        setDate(newDate)
        setMonth(newDate)
        setInputValue(formatDate(newDate))
      }
    } else {
      setDate(undefined)
      setInputValue("")
    }
  }, [externalValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setInputValue(inputValue)
    
    const newDate = new Date(inputValue)
    if (isValidDate(newDate)) {
      setDate(newDate)
      setMonth(newDate)
      
      // Create a synthetic event with ISO date format
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: formatToISO(newDate),
          },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setInputValue(formatDate(selectedDate))
    setOpen(false)
    
    if (onChange && selectedDate) {
      const syntheticEvent = {
        target: {
          value: formatToISO(selectedDate),
        },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  return (
    <div className="relative flex gap-2">
      <input
        id={id}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        className={`${inputClassName} pr-10 ${
          hasError ? "border-red-500 focus:ring-red-500 dark:border-red-500" : ""
        }`}
        onChange={handleInputChange}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
