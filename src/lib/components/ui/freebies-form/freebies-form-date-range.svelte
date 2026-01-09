<script lang="ts">
  import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import type { DateRange } from "bits-ui";
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone
  } from "@internationalized/date";
  import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils";
	import { freebieStore } from "$lib/stores/productsStore";

  export let freebieData;

  if(freebieData){
    freebieStore.update((data) => {
      data.startDate = freebieData.startDate;
      data.endDate = freebieData.endDate;
      console.log("data", data);
    });
  }
  
  const df = new DateFormatter("en-US", {
    dateStyle: "medium"
  });

  const getYearMonDay = (d: string , date: any) => {
    const opt = date.split('-');
    return d == 'year' ? parseInt(opt[0]) : d == 'month' ? parseInt(opt[1]) : parseInt(opt[2]);
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
 
  let value: DateRange = {
    start:  freebieData ? new CalendarDate(getYearMonDay('year', freebieData.startDate), getYearMonDay('month', freebieData.startDate), getYearMonDay('day', freebieData.startDate)) : new CalendarDate(year, month, day),
    end: freebieData ? new CalendarDate(getYearMonDay('year', freebieData.endDate), getYearMonDay('month', freebieData.endDate), getYearMonDay('day', freebieData.endDate)) : new CalendarDate(year, month, day).add({ days: 20 })
  };

  let startValue: DateValue | undefined = undefined;
</script>
<Popover.Root openFocus>
  <Popover.Trigger asChild let:builder>
    <Button
      variant="outline"
      class={cn(
        "w-[300px] justify-start text-left font-normal",
        !value && "text-muted-foreground"
      )}
      builders={[builder]}
    >
      <CalendarIcon class="mr-2 h-4 w-4" />
      {#if value && value.start}
        {#if value.end}
          {df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
            value.end.toDate(getLocalTimeZone())
          )}
        {:else}
          {df.format(value.start.toDate(getLocalTimeZone()))}
        {/if}
      {:else if startValue}
        {df.format(startValue.toDate(getLocalTimeZone()))}
      {:else}
        Pick a date
      {/if}
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0" align="start">
    <RangeCalendar
      bind:value
      bind:startValue
      initialFocus
      numberOfMonths={2}
      placeholder={value?.start}
    />
  </Popover.Content>
</Popover.Root>