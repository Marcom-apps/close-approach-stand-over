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

  const nzHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26",
    "2025-06-20", "2026-07-10", "2027-06-25", "2028-07-14", "2029-07-06"
  ];

  function getHolidayDates() {
    const baseYear = new Date().getFullYear();
    const holidays = [];
    for (let i = 0; i < 5; i++) {
      const y = baseYear + i;
      nzHolidays.forEach(h => holidays.push(h.length === 5 ? `${y}-${h}` : h));
    }
    return holidays;
  }

  const blocked = getNextWorkingDays(getBlockedWorkingDayCount());
  const minDateObj = new Date(blocked[blocked.length - 1]);
  minDateObj.setDate(minDateObj.getDate() + 1);
  const minDateStr = formatDate(minDateObj);
  const holidays = getHolidayDates();

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

      // default height fallback in case of iframe delay
      setTimeout(() => {
        JFCustomWidget.requestFrameResize({ height: 350 });
      }, 200);
    });

    JFCustomWidget.onSubmit(function () {
      JFCustomWidget.sendSubmit(input.value);
    });
  } else {
    // fallback for local testing
    flatpickr(input, {
      inline: true,
      dateFormat: "Y-m-d"
    });
  }
})();
