(function () {
  function formatDateDMY(date) {
    return date.toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Pacific/Auckland"
    }).split("/").join("-"); // Converts DD/MM/YYYY → DD-MM-YYYY
  }

  function getBlockedWorkingDayCount() {
    const now = new Date();
    const hour = now.toLocaleString("en-NZ", {
      hour: "numeric",
      hour12: false,
      timeZone: "Pacific/Auckland"
    });
    return parseInt(hour, 10) < 8 ? 6 : 5;
  }

  function getNextWorkingDays(count) {
    const workingDays = [];
    let current = new Date();
    while (workingDays.length < count) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays.push(formatDateDMY(new Date(current)));
      }
    }
    return workingDays;
  }

  const fixedHolidayDates = [
    "01-01", "02-01", "06-02", "18-04", "21-04", "25-04",
    "02-06", "28-06", "27-10", "25-12", "26-12"
  ];

  const matarikiDates = [
    "20-06-2025", "10-07-2026", "25-06-2027", "14-07-2028", "06-07-2029",
    "21-06-2030", "11-07-2031", "02-07-2032", "24-06-2033", "07-07-2034",
    "29-06-2035", "18-07-2036", "10-07-2037", "25-06-2038", "15-07-2039",
    "06-07-2040", "19-07-2041", "11-07-2042", "03-07-2043", "24-06-2044"
  ];

  function getAllHolidays() {
    const holidays = new Set(matarikiDates);
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= 2044; year++) {
      fixedHolidayDates.forEach(md => holidays.add(`${md}-${year}`));
    }
    return Array.from(holidays);
  }

  const blockedWorkdays = getNextWorkingDays(getBlockedWorkingDayCount());
  const minDateObj = new Date(blockedWorkdays[blockedWorkdays.length - 1]);
  minDateObj.setDate(minDateObj.getDate() + 1);
  const minDate = minDateObj;
  const holidays = getAllHolidays();

  function isBlocked(date) {
    const ymd = formatDateDMY(date);
    const day = date.getDay();
    return (
      day === 0 || // Sunday
      day === 6 || // Saturday
      ymd < formatDateDMY(minDate) ||
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
        dateFormat: "d-m-Y",
        disable: [
          function (date) {
            return isBlocked(date);
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
    // for testing locally
    flatpickr(input, {
      inline: true,
      dateFormat: "d-m-Y",
      disable: [
        function (date) {
          return isBlocked(date);
        }
      ]
    });
  }
})();
