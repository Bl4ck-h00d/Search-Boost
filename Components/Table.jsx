import React, { useState } from 'react'
import { Table } from 'antd'
import Search from './Search'
import data from '../data/data100k.json'


const columns = [
    {
        title: 'First Name',
        dataIndex: 'firstName',
    },
    {
        title: 'Last Name',
        dataIndex: 'lastName',
    },
    {
        title: 'Email',
        dataIndex: 'email',
    },
    {
        title: 'City',
        dataIndex: 'city',
    },
    {
        title: 'Country',
        dataIndex: 'country',
    },
    {
        title: 'Address',
        dataIndex: 'address',
    },
    {
        title: 'Genre',
        dataIndex: 'genre',
    },
]

const TableWrapper = () => {
    const newData = new Array(100).fill(data.objects).flat()
    const [dataSource, setDataSource] = useState(newData)
    return (
        <div className='container'>
            <span>{newData.length} records</span>
            <Search data={newData} setDataSource={setDataSource} />
            <Table className='table' columns={columns} dataSource={dataSource} />
        </div>
    )
}

export default TableWrapper