(function () {
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function getBlockedWorkingDayCount() {
    const hour = new Date().getHours();
    return hour < 8 ? 6 : 5;
  }

  function getNextWorkingDays(count) {
    const workingDays = [];
    let current = new Date();
    while (workingDays.length < count) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays.push(formatDate(new Date(current)));
      }
    }
    return workingDays;
  }

  // Base NZ holiday pattern (month-day)
  const nzHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26",
    "06-20", "07-10", "06-25", "07-14", "07-06" // Matariki rolling dates
  ];

  function getHolidayDatesIndefinitely() {
    const holidays = new Set();
    const yearStart = new Date().getFullYear();
    for (let year = yearStart; year <= yearStart + 20; year++) {
      nzHolidays.forEach(md => {
        if (md.match(/^\d{2}-\d{2}$/)) {
          holidays.add(`${year}-${md}`);
        } else if (md.match(/^\d{2}-\d{2}$/)) {
          holidays.add(`${year}-${md}`);
        } else {
          holidays.add(`${md}`); // already in YYYY-MM-DD format
        }
      });
    }
    return Array.from(holidays);
  }

  const blocked = getNextWorkingDays(getBlockedWorkingDayCount());
  const minDateObj = new Date(blocked[blocked.length - 1]);
  minDateObj.setDate(minDateObj.getDate() + 1);
  const minDateStr = formatDate(minDateObj);
  const holidays = getHolidayDatesIndefinitely();

  function isBlocked(date) {
    const ymd = formatDate(date);
    const day = date.getDay();
    return (
      day === 0 ||
      day === 6 ||
      ymd < minDateStr ||
      blocked.includes(ymd) ||
      holidays.includes(ymd)
    );
  }

  const input = document.getElementById("calendar");

  if (typeof JFCustomWidget !== "undefined") {
    JFCustomWidget.subscribe("ready", function () {
      JFCustomWidget.requestFrameResize({ height: 350 });

      flatpickr(input, {
        inline: true,
        dateFormat: "Y-m-d",
        disable: [
          function (date) {
            return isBlocked(date);
          }
        ],
        onChange: function (selectedDates, dateStr) {
          JFCustomWidget.sendData(dateStr);
        }
      });

      // backup in case iframe resize is slow
      setTimeout(() => {
        JFCustomWidget.requestFrameResize({ height: 350 });
      }, 200);
    });

    JFCustomWidget.onSubmit(function () {
      JFCustomWidget.sendSubmit(input.value);
    });
  } else {
    // fallback for local dev
    flatpickr(input, {
      inline: true,
      dateFormat: "Y-m-d"
    });
  }
})();
