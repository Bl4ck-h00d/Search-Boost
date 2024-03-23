/*eslint-disable*/
export default () => {
  self.addEventListener('message', e => {
    if (!e) return

    const { record, searchText } = e.data
    const start=performance.now()
    const filteredData = performSearch(record, searchText)
    const end = performance.now()
    // console.log("Thread computation time: ",end-start)
    postMessage(filteredData)
  })

  const performSearch = (data, value) => {
    value = value.trim()
    if (value == '') return data

    const filteredData = data.filter(record => {
      return Object.keys(record).some(key =>
        String(record[key])
          .toLowerCase()
          .includes(value.toLowerCase()),
      )
    })

    return filteredData
  }
}

