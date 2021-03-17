// function checkForIndexedDb() {
//     window.indexedDB =
//       window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  
//     window.IDBTransaction =
//       window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
//     window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  
//     if (!window.indexedDB) {
//       console.log("Your browser doesn't support a stable version of IndexedDB.");
//       return false;
//     }
//     return true;
//   }

//   const request = window.indexedDB.open("toDoList", 1);

//       // Create an object store inside the onupgradeneeded method.
//       //onupgradeneeded is a universal method also. It is how we create a table.
//       request.onupgradeneeded = ({ target }) => {
//         const db = target.result;
//         //const objectStore = db.createObjectStore("toDoList");

//         const transaction = db.transaction(["toDoList"], "readwrite");
//          //transaction means use todoList table and which objectstore are we dealing with? todoList
//         const toDoListStore = transaction.objectStore("toDoList");//this is used to add data within line 35 down.
//         const statusIndex = toDoListStore.index("statusIndex");
//       };

//       // On success console the result.
//       request.onsuccess = event => {
//         console.log(request.result);
//       };

let db;
let count = 0;
// create a new db request for a "budget" database.
const request = indexedDB.open('budget', 1)

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  db = request.result
  const objectStore = db.createObjectStore('pending', {keyPath: 'pendingID', autoIncrement: true})
  objectStore.createIndex('pendingIndex', 'pendingValue')

  console.log("")
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const transaction = db.transaction(['pending'], 'readwrite')
  const pendingStore = transaction.objectStore('pending')

  pendingStore.add({pendingID: count.toString(), pendingValue: record.value})
  count++
}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  const transaction = db.transaction(['pending'], 'readwrite')
  const budgetStore = transaction.objectStore('pending')
  const getAll = budgetStore.openCursor()
  
//below code is  previously given:
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
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
          const store = transaction.objectStore("pending");
          // clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
