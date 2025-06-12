export function getDayBoundsInUTC(date: Date, timeZone: string) {
  const localeDate = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [month, day, year] = localeDate.split("/");

  // Get start and end of day in user's time zone
  const startLocal = new Date(`${year}-${month}-${day}T00:00:00`);
  const endLocal = new Date(`${year}-${month}-${day}T23:59:59.999`);

  // Convert to UTC manually
  const utcStart = new Date(
    startLocal.toLocaleString("en-US", { timeZone: "UTC", hour12: false })
  );
  const utcEnd = new Date(
    endLocal.toLocaleString("en-US", { timeZone: "UTC", hour12: false })
  );

  return { timeMin: utcStart.toISOString(), timeMax: utcEnd.toISOString() };
}
