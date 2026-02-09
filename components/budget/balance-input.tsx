import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface BalanceInputProps {
	id: string;
	onBlur(value: number): any;
	defaultValue: number;
}

export function BalanceInput({
	id, onBlur, defaultValue
}: BalanceInputProps) {

	const field = {
		name: 'amount',
		defaultValue: { defaultValue },
		value: 0
	};

	const [displayValue, setDisplayValue] = useState('');

	// formatForDisplay — Takes a number and makes it pretty for the user:
	const formatForDisplay = (value: number | string): string => {
		if (!value && value !== 0) return '';
		const numValue = typeof value === 'string' ? parseFloat(value) : value;
		if (isNaN(numValue)) return '';

		return numValue.toLocaleString('es-AR', { // toLocaleString with Spanish Argentina format (dots for thousands, comma for decimal)
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
	};

	// parseValue — Converts the display format back to a number for storage:
	const parseValue = (displayStr: string): number => {
		if (!displayStr) return 0;
		const cleaned = displayStr.replace(/\./g, '').replace(',', '.');
		return parseFloat(cleaned) || 0;
	};

	// Handle input changes
	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget;
		const cursorPosition = input.selectionStart;
		const oldValue = input.value;

		// Keep only digits and comma
		let value = input.value.replace(/[^\d,]/g, '');

		const parts = value.split(',');

		// Format integer part with dots
		if (parts[0]) {
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		}

		// Limit decimals to 2
		if (parts[1]) {
			parts[1] = parts[1].slice(0, 2);
		}

		const formatted = parts.length > 1 ? `${parts[0]},${parts[1]}` : parts[0];

		setDisplayValue(formatted);

		// Restore cursor
		setTimeout(() => {
			const lengthDiff = formatted.length - oldValue.length;
			const newPosition = (cursorPosition ?? 0) + lengthDiff;
			input.setSelectionRange(newPosition, newPosition);
		}, 0);
	};

	// This watches for changes to field.value (which comes from external setValue() calls). When it changes, it automatically formats that number for display
	useEffect(() => {
		if (defaultValue !== undefined && defaultValue !== null) {
			const displayVal = formatForDisplay(defaultValue);
			setDisplayValue(displayVal);
		}
	}, [field.value]);

	return (
		<div className="space-y-2 pb-4">
			<div className="relative gap-2">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
				<Input
					type="text"
					id={id}
					aria-label="Monto"
					inputMode="decimal"
					enterKeyHint="done"
					value={displayValue}
					onChange={handleInput}
					onWheel={(e) => e.currentTarget.blur()}
					className="font-semibold md:text-2xl
					w-24 text-right text-sm"
					placeholder="1.000,00"
					onBlur={(e) => onBlur(parseValue(e.currentTarget.value))}
				/>
			</div>
			{/* {errors?.amount && (
				<p className="text-red-500 text-sm mt-1">
					{errors.amount.message as string}
				</p>
			)} */}
		</div>
	);
}