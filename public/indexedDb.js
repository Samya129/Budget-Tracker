let db;

// create a new db request for a "budget" database.
const request = indexedDB.open('budget', 1)

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore('pending', {autoIncrement: true});
};

request.onsuccess = function (event) {
  db = event.target.result;

// check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Database was unsuccessful" + event.target.errorCode);
};

function saveRecord(record) { //save to indexedDb forwhatever reason it's offline.
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const transaction = db.transaction(['pending'], 'readwrite');
  const pendingStore = transaction.objectStore('pending');

  pendingStore.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  const transaction = db.transaction(['pending'], 'readwrite');
  const budgetStore = transaction.objectStore('pending');
  const getAll = budgetStore.getAll();
  
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', { //extra stuff (offline)
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
          // access your pending object store
          const budgetStore = transaction.objectStore("pending");
          // clear all items in your store
          budgetStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
