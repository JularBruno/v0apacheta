export default function DataTable({
	caption,
	columns,
	rows,
}: {
	caption: string
	columns: string[]
	rows: string[][]
}) {
	rows.forEach((row, index) => {
		if (row.length !== columns.length) {
			throw new Error(`DataTable row ${index} has ${row.length} cells, expected ${columns.length}`)
		}
	})
	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full text-left text-sm">
				<caption className="p-3 text-left text-xs text-muted-foreground">{caption}</caption>
				<thead className="bg-muted">
					<tr>
						{columns.map((column) => (
							<th key={column} scope="col" className="px-3 py-2 font-semibold text-foreground">
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIndex) => (
						<tr key={rowIndex} className="border-t border-border">
							{row.map((cell, cellIndex) => (
								<td key={cellIndex} className="px-3 py-2">
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
