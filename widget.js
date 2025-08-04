// widget.js

function toISODate(d) {
  const z = n => ('0' + n).slice(-2);
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}

function getNZNow() {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  // Determine if NZ is currently in Daylight Saving Time
  const offset = isNZDST(now) ? 13 : 12; // UTC+13 in DST, otherwise UTC+12
  return new Date(utcTime + offset * 3600000);
}

function isNZDST(date) {
  const year = date.getFullYear();
  // DST starts last Sunday in September
  const start = new Date(Date.UTC(year, 8, 30));
  start.setDate(start.getDate() + (7 - start.getUTCDay()) % 7);
  // DST ends first Sunday in April
  const end = new Date(Date.UTC(year, 3, 1)); // Start of April
  end.setDate(end.getDate() + (7 - end.getUTCDay()) % 7); // First Sunday in April
  return date >= start || date < end; // Corrected DST logic: if date is after start OR before end (for the next year's start)
}


function getFixedNZHolidays(year) {
  return [
    `01-01`, `02-06`, `04-25`, `12-25`, `12-26`
  ].map(d => `${year}-${d}`);
}

function getVariableNZHolidays() {
  return [
    "2026-04-03", "2026-04-06", "2026-06-01", "2026-10-26", "2026-07-17",
    "2027-03-26", "2027-03-29", "2027-06-07", "2027-10-25", "2027-07-09",
    "2028-04-14", "2028-04-17", "2028-06-05", "2028-10-23", "2028-06-28",
    "2029-03-30", "2029-04-02", "2029-06-04", "2029-10-22", "2029-07-06",
    "2030-04-19", "2030-04-22", "2030-06-03", "2030-10-28", "2030-06-21",
    "2031-04-11", "2031-04-14", "2031-06-02", "2031-10-27", "2031-07-11",
    "2032-03-26", "2032-03-29", "2032-06-07", "2032-10-25", "2032-07-02",
    "2033-04-15", "2033-04-18", "2033-06-06", "2033-10-24", "2033-06-24",
    "2034-04-07", "2034-04-10", "2034-06-05", "2034-10-23", "2034-07-07",
    "2035-03-23", "2035-03-26", "2035-06-04", "2035-10-22", "2035-06-22",
    "2036-04-11", "2036-04-14", "2036-06-02", "2036-10-27", "2036-07-11",
    "2037-04-03", "2037-04-06", "2037-06-01", "2037-10-26", "2037-06-26",
    "2038-04-23", "2038-04-26", "2038-06-07", "2038-10-25", "2038-07-16",
    "2039-04-08", "2039-04-11", "2039-06-06", "2039-10-24", "2039-07-01",
    "2040-03-30", "2040-04-02", "2040-06-04", "2040-10-22", "2040-06-20",
    "2041-04-19", "2041-04-22", "2041-06-03", "2041-10-28", "2041-07-12",
    "2042-04-04", "2042-04-07", "2042-06-02", "2042-10-27", "2042-06-27",
    "2043-03-27", "2043-03-30", "2043-06-01", "2043-10-26", "2043-07-10",
    "2044-04-15", "2044-04-18", "2044-06-06", "2044-10-24", "2044-06-30",
    "2045-03-31", "2045-04-03", "2045-06-05", "2045-10-23", "2045-07-14"
  ];
}

function getNextWeekdaysIncludingToday(startDate, count) {
  const disabled = new Set();
  let date = new Date(startDate);
  // Ensure we start checking from the current day or the next day
  // depending on whether we want to include today in the count of "next weekdays" for disabling.
  // For the purpose of "notice period", we want to disable a certain number of upcoming weekdays *from* today.

  let daysCounted = 0;
  while (daysCounted < count) {
    if (date.getDay() !== 0 && date.getDay() !== 6) { // If it's a weekday
      disabled.add(toISODate(date));
      daysCounted++;
    }
    date.setDate(date.getDate() + 1);
  }
  return Array.from(disabled);
}


// --- Main Logic ---

const now = getNZNow();
const todayNZ = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today's date in NZT, stripped of time
const before8am = now.getHours() < 8;

// Calculate disabled weekdays for the notice period
// If it's before 8 AM, disable today and the next 1 weekdays (total 2).
// If it's after 8 AM, disable today and the next 2 weekdays (total 3).
const disabledWeekdays = getNextWeekdaysIncludingToday(now, before8am ? 1 : 2);

// Get all fixed and variable NZ holidays for the current and upcoming years
const fixedHolidays = Array.from({ length: 2 }, (_, i) => getFixedNZHolidays(now.getFullYear() + i)).flat(); // Check current and next year
const variableHolidays = getVariableNZHolidays();

// Combine all disabled dates into a single Set for efficient lookup
const allDisabledDatesSet = new Set([...disabledWeekdays, ...fixedHolidays, ...variableHolidays]);

function getNextAvailableDateForSelection() {
  let date = new Date(todayNZ); // Start checking from today
  const maxCheckDays = 365 * 2; // Check up to two years to find an available date

  for (let i = 0; i < maxCheckDays; i++) {
    const testDate = new Date(date);
    testDate.setDate(date.getDate() + i); // Increment day

    const iso = toISODate(testDate);
    const isWeekend = testDate.getDay() === 0 || testDate.getDay() === 6;
    const isHolidayOrNoticePeriod = allDisabledDatesSet.has(iso);

    // A date is available if it's not a weekend and not marked as disabled (holiday or notice period)
    if (!isWeekend && !isHolidayOrNoticePeriod) {
      return testDate;
    }
  }
  return null; // Fallback if no date is found within the maxCheckDays
}

const nextAvailableDateToSet = getNextAvailableDateForSelection();


flatpickr("#calendar", {
  inline: true,
  disable: [
    function(date) {
      const isPastDate = date < todayNZ; // This must reference the NZ-adjusted date
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHolidayOrNoticePeriod = allDisabledDatesSet.has(toISODate(date));
      return isPastDate || isWeekend || isHolidayOrNoticePeriod;
    }
  ],
  dateFormat: "d/m/Y",
  defaultDate: nextAvailableDateToSet,
  locale: {
    firstDayOfWeek: 1
  },
  onReady: function(selectedDates, dateStr, instance) {
    if (nextAvailableDateToSet) {
      instance.jumpToDate(nextAvailableDateToSet);
      instance.setDate(nextAvailableDateToSet, true); // This sets the input value
    }
  }
});


JFCustomWidget.subscribe("ready", function(){
  var label = JFCustomWidget.getWidgetSetting('QuestionLabel');
  document.getElementById('labelText').innerHTML = label;
});
