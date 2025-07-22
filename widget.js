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

  // Base NZ holiday pattern (month-day) + rolling Matariki dates
  const nzFixedHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26"
  ];
  const nzMatarikiDates = [
    "2025-06-20", "2026-07-10", "2027-06-25", "2028-07-14", "2029-07-06"
  ];

  function getHolidayDatesIndefinitely() {
    const holidays = new Set();
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y <= currentYear + 20; y++) {
      nzFixedHolidays.forEach(md => {
        holidays.add(`${y}-${md}`);
      });
    }
    nzMatarikiDates.forEach(fullDate => holidays.add(fullDate));
    return Array.from(holidays);
  }

  const blockedWorkdays = getNextWorkingDays(getBlockedWorkingDayCount());
  const minDateObj = new Date(blockedWorkdays[blockedWorkdays.length - 1]);
  minDateObj.setDate(minDateObj.getDate() + 1);
  const minDateStr = formatDate(minDateObj);
  const holidays = getHolidayDatesIndefinitely();

  function isBlocked(date) {
    const ymd = formatDate(date);
    const day = date.getDay();
    return (
      day === 0 || // Sunday
      day === 6 || // Saturday
      ymd < minDateStr ||
      blockedWorkdays.includes(ymd) ||
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
            return isBlocked(date); // must return true to disable
          }
        ],
        onChange: function (selectedDates, dateStr) {
          JFCustomWidget.sendData(dateStr);
        }
      });

      setTimeout(() => {
        JFCustomWidget.requestFrameResize({ height: 350 });
      }, 200);
    });

    JFCustomWidget.onSubmit(function () {
      JFCustomWidget.sendSubmit(input.value);
    });
  } else {
    // for testing outside of Jotform
    flatpickr(input, {
      inline: true,
      dateFormat: "Y-m-d",
      disable: [
        function (date) {
          return isBlocked(date);
        }
      ]
    });
  }
})();
