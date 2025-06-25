(function () {
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function getBlockedWorkingDayCount() {
    const hour = new Date().getHours();
    return hour < 8 ? 6 : 5;
  }

  function getNextWorkingDays(count) {
    const days = [];
    let d = new Date();
    while (days.length < count) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(formatDate(new Date(d)));
      }
    }
    return days;
  }

  const nzHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26",
    "2025-06-20", "2026-07-10", "2027-06-25", "2028-07-14", "2029-07-06"
  ];

  function getHolidayDates() {
    const year = new Date().getFullYear();
    const holidays = [];
    for (let i = 0; i < 5; i++) {
      const y = year + i;
      nzHolidays.forEach(h => holidays.push(h.length === 5 ? `${y}-${h}` : h));
    }
    return holidays;
  }

  const blocked = getNextWorkingDays(getBlockedWorkingDayCount());
  const minDate = new Date(blocked[blocked.length - 1]);
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = formatDate(minDate);
  const holidays = getHolidayDates();

  const disableDates = [
    function (date) {
      const ymd = formatDate(date);
      return (
        date.getDay() === 0 ||
        date.getDay() === 6 ||
        ymd < minDateStr ||
        blocked.includes(ymd) ||
        holidays.includes(ymd)
      );
    }
  ];

  const input = document.getElementById("calendar");

  const calendar = flatpickr(input, {
    disable: disableDates,
    dateFormat: "Y-m-d",
    appendTo: document.body, // ensure calendar is outside iframe container
    onOpen: function () {
      const popup = document.querySelector(".flatpickr-calendar");
      if (popup && !popup.parentNode.isSameNode(document.body)) {
        document.body.appendChild(popup);
      }
    },
    onChange: function (selectedDates, dateStr) {
      if (typeof JFCustomWidget !== "undefined") {
        JFCustomWidget.sendData(dateStr);
      }
    }
  });

  if (typeof JFCustomWidget !== "undefined") {
    JFCustomWidget.init({
      height: 50, // hard-set to avoid Jotform resizing
      onSubmit: function () {
        JFCustomWidget.sendSubmit(input.value);
      }
    });
  }
})();
