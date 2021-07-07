import React, { useState, useEffect } from "react";
import MaterialTable from "material-table";

const MaterialTableEditing = ({ height, width, title, rows = [], column = [], rowKey = 'id', onChange, ...props }) => {
    const [dataSource, setDataSource] = useState(rows || [])
    const [columns, setColumns] = useState(column || [])

    useEffect(() => {
        setDataSource(rows)
    }, [rows])

    useEffect(() => {
        setColumns(column)
    }, [column])

    return (
        <div style={{ height: height || 'unset', width: width || "100%" }}>
            <MaterialTable
                title={title || ''}
                columns={columns}
                data={dataSource}
                editable={{
                    onSelectType: newData => {
                        console.log('newData: ', newData)
                    },
                    onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                setDataSource([...dataSource, newData]);

                                resolve();
                            }, 0)
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const dataUpdate = [...dataSource];
                                const index = oldData.tableData.id;
                                dataUpdate[index] = newData;
                                setDataSource([...dataUpdate]);

                                resolve();
                            }, 0)
                        }),
                    onRowDelete: oldData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const dataDelete = [...dataSource];
                                const index = oldData.tableData.id;
                                dataDelete.splice(index, 1);
                                setDataSource([...dataDelete]);

                                resolve();
                            }, 0)
                        }),
                }}
                {...props}
            />
        </div>
    )
}

export default MaterialTableEditing;
