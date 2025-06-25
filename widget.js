(function () {
  // Format date as YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Get number of working days to block
  function getBlockedWorkingDayCount() {
    const now = new Date();
    const hour = now.getHours();
    return hour < 8 ? 6 : 5;
  }

  // Get next N working days from today
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

  // NZ public holidays: static and Matariki for 2025–2029
  const nzHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26",
    "2025-06-20", "2026-07-10", "2027-06-25", "2028-07-14", "2029-07-06"
  ];

  function getHolidayDates() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    let holidays = [];

    for (let year of years) {
      for (let h of nzHolidays) {
        if (h.length === 5) {
          holidays.push(`${year}-${h}`);
        } else if (h.startsWith(`${year}`)) {
          holidays.push(h);
        }
      }
    }
    return holidays;
  }

  // Get flatpickr date disabling rules
  function getDisableRules(blockedDates, minSelectableDateStr, publicHolidays) {
    return [
      function (date) {
        const ymd = formatDate(date);

        // Disable weekends
        const day = date.getDay();
        if (day === 0 || day === 6) return true;

        // Disable past or too-early dates
        if (ymd < minSelectableDateStr) return true;

        // Disable blocked working days
        if (blockedDates.includes(ymd)) return true;

        // Disable public holidays
        if (publicHolidays.includes(ymd)) return true;

        return false; // date is allowed
      }
    ];
  }

  // Initialization logic
  const blockCount = getBlockedWorkingDayCount();
  const blockedDates = getNextWorkingDays(blockCount);
  const lastBlocked = new Date(blockedDates[blockedDates.length - 1]);
  const minSelectableDateStr = formatDate(new Date(lastBlocked.setDate(lastBlocked.getDate() + 1)));
  const publicHolidays = getHolidayDates();

  const calendarInput = document.getElementById("calendar");

  const calendar = flatpickr(calendarInput, {
    disable: getDisableRules(blockedDates, minSelectableDateStr, publicHolidays),
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr) {
      if (typeof JFCustomWidget !== "undefined") {
        JFCustomWidget.sendData(dateStr);
      }
    }
  });

  // Ensure widget container allows calendar to float
  setTimeout(() => {
    const container = document.body.parentElement;
    if (container) {
      container.style.overflow = 'visible';
      container.style.position = 'relative';
    }
  }, 300);

  // Jotform widget submission hook
  if (typeof JFCustomWidget !== "undefined") {
    JFCustomWidget.init({
      onSubmit: function () {
        const selected = calendarInput.value;
        JFCustomWidget.sendSubmit(selected);
      }
    });
  }
})();
