import WebWorker from './WebWorker'
import worker from './worker'

// Esitimates logical core on user's machine
const NUM_WORKERS = navigator.hardwareConcurrency

let workerPool = [];
let dataChunks = []
let threadSyncFlag = 0
let searchResult = []


/**
 * Initializes the worker pool and assigns tasks to worker threads
 * @param {*} dataSource - The data source to be processed
 * @param {*} callback - The callback function to handle search results
 */
export const init = (dataSource, callback) => {
  // Clearing the worker pool
  workerPool = []

  // Initializing worker pool
  for (let i = 0; i < NUM_WORKERS; i++) {
    const workerThread = new WebWorker(worker);
    workerPool.push(workerThread);

    // Listen for messages from worker threads
    workerThread.addEventListener('message', (event) => handleMessage(event, callback));
  }

  // Split the data into chunks based on the number of available logical cores
  dataChunks = chunkifyRecordsPerCore(dataSource);
}


/**
 * Handles messages received from worker threads
 * @param {*} event - The message event
 * @param {*} callback - The callback function to handle search results
 */
const handleMessage = (event, callback) => {
  const searchedRecords = event.data
  threadSyncFlag += 1 // increment when a thread returns

  if (threadSyncFlag === 1) {
    searchResult = [...searchedRecords] // First thread returns
  } else {
    searchResult = [...searchResult, ...searchedRecords] // Subsequent thread returns
  }

  callback(searchResult)
}


/**
 * Splits the data into chunks based on the number of available logical cores
 * @param {*} data - The data source to be chunkified
 * @returns Array of data chunks
 */
const chunkifyRecordsPerCore = (data) => {
  let prevIdx = 0
  const recordsPerCore = []

  for (let core = 0; core < NUM_WORKERS; core += 1) {
    recordsPerCore.push(data.slice(prevIdx, prevIdx + Math.ceil(data.length / NUM_WORKERS)))
    prevIdx += Math.ceil(data.length / NUM_WORKERS)
  }

  return [...recordsPerCore]
}


/**
 * Initiates the search operation by dispatching tasks to worker threads
 * @param {*} query - The search query
 * @param {*} setMetrics - The function to set performance metrics
 */
export const searchBoost = (query, setMetrics) => {
  threadSyncFlag = 0 // Reset the thread synchronization flag
  searchResult = [] // Clear the search result

  const taskQueue = []; // Task queue to store pending search tasks

  // Function to check if a worker is available
  const isWorkerAvailable = () => {
    return workerPool.some(worker => !worker.isBusy); // Check if any worker is not busy
  };

  // Function to execute pending tasks
  const executePendingTasks = () => {
    while (taskQueue.length > 0 && isWorkerAvailable()) {
      const task = taskQueue.shift(); // Get the next task from the queue
      executeTask(task); // Execute the task
    }
  };

  // Function to execute a search task
  const executeTask = ({ idx, workerThread }) => {
    const start = performance.now();
    workerThread.isBusy = true; // Mark the worker as busy
    workerThread.postMessage({
      record: dataChunks[idx],
      searchText: `${query}`,
    });

    workerThread.addEventListener('message', () => {
      const end = performance.now(); // End measuring thread processing time
      console.log(`Thread ${idx} execution time: ${end - start} milliseconds`);
      setMetrics(prevState => [...prevState, end - start]);
      workerThread.isBusy = false; // Mark the worker as available
      executePendingTasks(); // Execute pending tasks
    });
  };

  // Dispatch tasks to worker threads or add to the task queue
  for (const [idx, workerThread] of workerPool.entries()) {
    if (isWorkerAvailable()) {
      executeTask({ idx, workerThread }); // Execute task if worker is available
    } else {
      taskQueue.push({ idx, workerThread }); // Add task to the queue
    }
  }

}
