import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormClearErrors, Control, useController } from 'react-hook-form';

interface BalanceInputProps {
	errors: FieldErrors;
	clearErrors: UseFormClearErrors<any>;
	control: Control<any>;
}

export function BalanceInput({ errors, clearErrors, control }: BalanceInputProps) {

	const { field } = useController({
		name: 'amount',
		control,
		defaultValue: '',
	});

	const [displayValue, setDisplayValue] = useState('');

	// Format number for display
	const formatForDisplay = (value: number | string): string => {
		if (!value && value !== 0) return '';
		const numValue = typeof value === 'string' ? parseFloat(value) : value;
		if (isNaN(numValue)) return '';

		return numValue.toLocaleString('es-AR', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
	};

	// Parse display value back to number
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
		field.onChange(parseValue(formatted));

		// Restore cursor
		setTimeout(() => {
			const lengthDiff = formatted.length - oldValue.length;
			const newPosition = (cursorPosition ?? 0) + lengthDiff;
			input.setSelectionRange(newPosition, newPosition);
		}, 0);
	};

	// When external setValue is called, update display
	useEffect(() => {
		if (field.value !== undefined && field.value !== null) {
			const displayVal = formatForDisplay(field.value);
			setDisplayValue(displayVal);
		}
	}, [field.value]);

	return (
		<div className="space-y-2 pb-4">
			<Label className="text-sm text-gray-600">Monto</Label>
			<div className="relative gap-2">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
				<Input
					type="text"
					id="amount"
					aria-label="Monto"
					inputMode="decimal"
					enterKeyHint="done"
					value={displayValue}
					onChange={handleInput}
					onWheel={(e) => e.currentTarget.blur()}
					className="pl-8 h-12 text-xl font-semibold md:text-2xl"
					placeholder="1.000,00"
					onKeyDown={() => clearErrors('amount')}
				/>
			</div>
			{errors?.amount && (
				<p className="text-red-500 text-sm mt-1">
					{errors.amount.message as string}
				</p>
			)}
		</div>
	);
}