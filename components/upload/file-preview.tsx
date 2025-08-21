interface FilePreviewProps {
  data: string[][]
}

export function FilePreview({ data }: FilePreviewProps) {
  if (data.length === 0) return null

  const headers = data[0]
  const rows = data.slice(1, 6) // Show first 5 rows

  return (
    <div className="mt-4">
      <h5 className="font-medium mb-2">File Preview (First 5 rows)</h5>
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="text-left p-2 font-medium border-r last:border-r-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-2 border-r last:border-r-0 max-w-[150px] truncate">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 6 && <p className="text-xs text-muted-foreground mt-2">... and {data.length - 6} more rows</p>}
    </div>
  )
}
