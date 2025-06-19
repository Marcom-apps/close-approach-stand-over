(function() {
  // === Utility ===
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // === Step 1: Next 5 working days ===
  function getNextWorkingDays(count) {
    const today = new Date();
    let workingDays = [];
    let current = new Date(today);
    
    while (workingDays.length < count) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays.push(new Date(current));
      }
    }
    return workingDays.map(formatDate);
  }

  // === Step 2: Public holidays in NZ (2025–2029) ===
  const nzHolidays = [
    // STATIC HOLIDAYS (most do not shift on weekends)
    "01-01", // New Year's Day
    "01-02", // Day after New Year's
    "02-06", // Waitangi Day
    "04-25", // ANZAC Day
    "06-01", // King's Birthday (1st Monday of June, simplified as June 1 fallback)
    "10-28", // Labour Day (last Monday of October, simplified here)
    "12-25", // Christmas Day
    "12-26", // Boxing Day

    // Matariki (variable date, manually included below for each year)
    "2025-06-20",
    "2026-07-10",
    "2027-06-25",
    "2028-07-14",
    "2029-07-06",
  ];

  // Function to expand yyyy-MM-dd and yyyy-MM-dd format holidays for each year
  function getHolidayDates() {
    const today = new Date();
    const startYear = today.getFullYear();
    const years = Array.from({length: 5}, (_, i) => startYear + i);

    let holidays = [];

    for (let year of years) {
      for (let h of nzHolidays) {
        if (h.includes("-")) {
          // Already a full YYYY-MM-DD (Matariki)
          if (h.startsWith(year.toString())) {
            holidays.push(h);
          } else if (h.length === 5) {
            // MM-DD — add year
            holidays.push(`${year}-${h}`);
          }
        }
      }

      // Add dynamic holidays if desired later (e.g. Easter)
    }

    return holidays;
  }

  // === Collect all dates to disable ===
  const disableDates = [
    ...getNextWorkingDays(5),
    ...getHolidayDates()
  ];

  // === Initialize calendar ===
  const calendarInput = document.getElementById("calendar");
  const calendar = flatpickr(calendarInput, {
    disable: disableDates,
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr, instance) {
      if (typeof JFCustomWidget !== "undefined") {
        JFCustomWidget.sendData(dateStr);
      }
    }
  });

  // === Jotform init ===
  if (typeof JFCustomWidget !== "undefined") {
    JFCustomWidget.init({
      onSubmit: function() {
        const selected = calendarInput.value;
        JFCustomWidget.sendSubmit(selected);
      }
    });
  }
})();
