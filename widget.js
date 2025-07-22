(function () {
  function formatDateISO(date) {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`; // Local-safe YYYY-MM-DD
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

  const variableHolidays = [
    "2026-04-03", "2026-04-06", "2026-06-01", "2026-07-10", "2026-10-26",
    "2027-03-26", "2027-03-29", "2027-06-07", "2027-06-25", "2027-10-23",
    "2028-04-14", "2028-04-17", "2028-06-05", "2028-07-14", "2028-10-22",
    "2029-04-06", "2029-04-08", "2029-06-04", "2029-07-06", "2029-10-28",
    "2030-03-29", "2030-04-01", "2030-06-03", "2030-06-21", "2030-10-28",
    "2031-04-18", "2031-04-21", "2031-06-02", "2031-07-11", "2031-10-27",
    "2032-04-10", "2032-04-12", "2032-06-01", "2032-07-02", "2032-10-26",
    "2033-04-01", "2033-04-03", "2033-06-07", "2033-06-24", "2033-10-24",
    "2034-04-21", "2034-04-23", "2034-06-05", "2034-07-07", "2034-10-23",
    "2035-04-13", "2035-04-15", "2035-06-04", "2035-06-29", "2035-10-22",
    "2036-03-28", "2036-03-30", "2036-06-02", "2036-07-18", "2036-10-27",
    "2037-04-16", "2037-04-19", "2037-06-01", "2037-07-10", "2037-10-26",
    "2038-04-08", "2038-04-11", "2038-06-07", "2038-06-25", "2038-10-25",
    "2039-03-31", "2039-04-03", "2039-06-06", "2039-07-15", "2039-10-23",
    "2040-04-20", "2040-04-22", "2040-06-04", "2040-07-06", "2040-10-22",
    "2041-04-04", "2041-04-07", "2041-06-02", "2041-07-19", "2041-10-27",
    "2042-03-27", "2042-03-30", "2042-06-01", "2042-07-11", "2042-10-26",
    "2043-04-16", "2043-04-19", "2043-06-07", "2043-07-03", "2043-10-25",
    "2044-04-07", "2044-04-10", "2044-06-05", "2044-06-24", "2044-10-23",
    "2045-03-30", "2045-04-02", "2045-06-04", "2045-07-13", "2045-10-22"
  ];

  function dmyToISO(dmy) {
    const [day, month, year] = dmy.split("-");
    return `${year}-${month}-${day}`;
  }

  function getAllBlockedHolidayISOs() {
    const holidays = new Set();
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y <= 2045; y++) {
      fixedHolidayDMYs.forEach(dmy => holidays.add(dmyToISO(`${dmy}-${y}`)));
    }
    variableHolidays.forEach(date => holidays.add(date));
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
        disable: [isBlocked],
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
