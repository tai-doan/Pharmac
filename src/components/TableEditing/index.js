import React, { useState, useEffect } from "react";
import { DataGrid } from "@material-ui/data-grid";

const TableEditing = ({ height, width, rows, column, rowKey = 'id', onChange, ...props }) => {
    const [dataSource, setDataSource] = useState(rows || [])
    const [columns, setColumns] = useState(column || [])

    useEffect(() => {
        setDataSource(rows)
    }, [rows])

    useEffect(() => {
        setColumns(column)
    }, [column])

    const handleRowChange = items => {
        let rowEdit = dataSource.find(item => item[rowKey] === items[rowKey])
        rowEdit[items.field] = items.props.value;
        const newRowData = { ...dataSource, ...rowEdit };
        setDataSource(newRowData)
        onChange(newRowData);
    }

    return (
        <div style={{ height: height || 'unset', width: width || "100%" }}>
            <DataGrid
                disableExtendRowFullWidth
                disableDensitySelector
                disableColumnSelector
                disableColumnMenu
                hideFooterSelectedRowCount
                rows={dataSource}
                columns={columns}
                onEditCellChangeCommitted={handleRowChange}
                {...props}
            />
        </div>
    )
}

export default TableEditing;
