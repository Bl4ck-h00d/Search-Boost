import React, { useState, useEffect } from 'react'
import { Input, Button, Checkbox } from 'antd';
import { searchBoost, init } from '../SearchBoost'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'


const SearchWrapper = ({ data, setDataSource }) => {

    const [filteredData, setFilteredData] = useState(data)
    const [metrics, setMetrics] = useState([])
    const [enableSearchBoost, setEnableSearchBoost] = useState(0)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        setDataSource(filteredData)
    }, [filteredData])

    useEffect(() => {
        init(data, setFilteredData)
    })

    const handleSearchAlgo = () => {
        setMetrics([])
        setEnableSearchBoost(prevState => !prevState)
    }

    const throttleSearchInput = callback => {
        let timeoutId

        return function () {
            const args = arguments
            const context = this

            // Clear previous timeout
            clearTimeout(timeoutId)

            // Set new timeout
            timeoutId = setTimeout(function () {
                callback.apply(context, args)
            }, 300)
        }
    }

    const performSearch = query => {
        query = query.trim()
        if (query == '') return setFilteredData(data)

        if (enableSearchBoost)
            searchBoost(query, setMetrics)
        else
            vanillaSearch(query, data)
    }

    const vanillaSearch = (query, data) => {
        const start = performance.now()

        const filteredData = data.filter(record => {
            return Object.keys(record).some(key =>
                String(record[key])
                    .toLowerCase()
                    .includes(query.toLowerCase()),
            )
        })

        setFilteredData(filteredData)
        const end = performance.now()
        console.log(end - start)
        setMetrics([end - start])
    }

    const handleSearch = throttleSearchInput(performSearch)


    return (
        <div className="search-container" >
            <Input className='search-input' placeholder="Search"
                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} onChange={e => handleSearch(e.target.value)} />

            <div>
                <Checkbox checked={!enableSearchBoost} onChange={handleSearchAlgo}>Vanilla Search</Checkbox>
                <Checkbox checked={enableSearchBoost} onChange={handleSearchAlgo}>Search Boost</Checkbox>
            </div>

            <div className='metrics'>
                <span>Performance: {metrics.length > 0 ? Math.max(...metrics) / 1000 : 0} seconds</span>
            </div>
        </div>
    )
}

export default SearchWrapper