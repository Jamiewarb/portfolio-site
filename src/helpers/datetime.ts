export function humanReadableDate(date: Date): string {
	return date.toLocaleDateString('en-gb', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}