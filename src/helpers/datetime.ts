export function humanReadableDate(date: Date): string {
  return date.toLocaleDateString('en-gb', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function copyrightYearRange(startYear: string): string {
  const currentYear = new Date().getFullYear().toString();

  if (startYear === currentYear) {
    return startYear;
  }

  return `${startYear}—${currentYear}`;
}
