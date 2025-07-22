(function () {
  function formatDateISO(date) {
    const iso = new Date(date.toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
    return iso.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  function getBlockedWorkingDayCount() {
    const nzHour = new Date().toLocaleString("en-NZ", {
      hour: "numeric",
      hour12: false,
      timeZone: "Pacific/Auckland"
    });
    return parseInt(nzHour, 10) < 8 ? 6 : 5;
  }

  function getNextWorkingDaysISO(count) {
    const workingDays = [];
    let current = new Date();
    while (workingDays.length < count) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays.push(formatDateISO(new Date(current)));
      }
    }
    return workingDays;
  }

  const fixedHolidayDMYs = [
    "01-01", "02-01", "06-02", "18-04", "21-04", "25-04",
    "02-06", "28-06", "27-10", "25-12", "26-12"
  ];
  const matarikiDMYs = [
    "20-06-2025", "10-07-2026", "25-06-2027", "14-07-2028", "06-07-2029",
    "21-06-2030", "11-07-2031", "02-07-2032", "24-06-2033", "07-07-2034",
    "29-06-2035", "18-07-2036", "10-07-2037", "25-06-2038", "15-07-2039",
    "06-07-2040", "19-07-2041", "11-07-2042", "03-07-2043", "24-06-2044"
  ];

  function dmyToISO(dmy) {
    const [day, month, year] = dmy.split("-");
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  }

  function getAllBlockedHolidayISOs() {
    const holidays = new Set();
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y <= 2044; y++) {
      fixedHolidayDMYs.forEach(dmy => holidays.add(dmyToISO(`${dmy}-${y}`)));
    }
    matarikiDMYs.forEach(dmy => holidays.add(dmyToISO(dmy)));
    return Array.from(holidays);
  }

  const holidaysISO = getAllBlockedHolidayISOs();
  const blockedWorkdaysISO = getNextWorkingDaysISO(getBlockedWorkingDayCount());

  const minDateISO = blockedWorkdaysISO[blockedWorkdaysISO.length - 1];

  function isBlocked(date) {
    const iso = formatDateISO(date);
    const day = date.getDay();
    return (
      day === 0 ||
      day === 6 ||
      iso < minDateISO ||
      blockedWorkdaysISO.includes(iso) ||
      holidaysISO.includes(iso)
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
          isBlocked
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
    flatpickr(input, {
      inline: true,
      dateFormat: "d-m-Y",
      disable: [isBlocked]
    });
  }
})();
