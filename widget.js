(function () {
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function getBlockedWorkingDayCount() {
    const now = new Date();
    return now.getHours() < 8 ? 6 : 5;
  }

  function getNextWorkingDays(count) {
    const today = new Date();
    const workingDays = [];
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

  const nzHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26",
    "2025-06-20", "2026-07-10", "2027-06-25", "2028-07-14", "2029-07-06"
  ];

  function getHolidayDates() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    let dates = [];

    for (let year of years) {
      for (let h of nzHolidays) {
        dates.push(h.length === 5 ? `${year}-${h}` : h);
      }
    }
    return dates;
  }

  function getDisableRules(blocked, minDate, holidays) {
    return [
      function (date) {
        const ymd = formatDate(date);
        const day = date.getDay();
        return (
          day === 0 || day === 6 ||
          ymd < minDate ||
          blocked.includes(ymd) ||
          holidays.includes(ymd)
        );
      }
    ];
  }

  const blockCount = getBlockedWorkingDayCount();
  const blockedDates = getNextWorkingDays(blockCount);
  const minSelectable = new Date(blockedDates[blockedDates.length - 1]);
  minSelectable.setDate(minSelectable.getDate() + 1);
  const minDateStr = formatDate(minSelectable);
  const holidays = getHolidayDates();

  const input = document.getElementById("calendar");

  const calendar = flatpickr(input, {
    disable: getDisableRules(blockedDates, minDateStr, holidays),
    dateFormat: "Y-m-d",
    onOpen: function () {
      // move calendar popup to top level
      const popup = document.querySelector('.flatpickr-calendar');
      if (popup) {
        document.body.appendChild(popup);
      }
    },
    onChange: function (selectedDates, dateStr) {
      if (typeof JFCustomWidget !== "undefined") {
        JFCustomWidget.sendData(dateStr);
      }
    }
  });

  // Force outer containers to allow overflow
  setTimeout(() => {
    let parent = document.body.parentElement;
    while (parent) {
      parent.style.overflow = "visible";
      parent.style.position = "relative";
      parent = parent.parentElement;
    }
  }, 300);

  if (typeof JFCustomWidget !== "undefined") {
    JFCustomWidget.init({
      onSubmit: function () {
        JFCustomWidget.sendSubmit(input.value);
      }
    });
  }
})();
