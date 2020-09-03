export class AVSCFormatter {
	format(text: string): string {
		try {
			return JSON.stringify(JSON.parse(text), null, 4); 
		}
		catch {
			return text;
		}
	}
}