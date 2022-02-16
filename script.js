let DB;
const frmContact = document.getElementById("frmContact");
const inputName = document.getElementById("inName");
const inputNumber = document.getElementById("inNumber");
const btnSave = document.getElementById("btn-save");
const contactsList = document.getElementById("contacts");
const contUpdate = document.querySelector(".update-container");
const inNameUpdate = document.getElementById("in-updateName");
const inNumberUpdate = document.getElementById("in-updateNumber");
const btnSaveUpdate = document.getElementById("btn-save-update");
const btnClose = document.getElementById("btn-cancel-update");
let updateId;
// Start EventListener Window For Create DB
window.onload = () => {
        let request = window.indexedDB.open("contacts", 1);
        request.onerror = () => {
            // console.log("Database Failed To Open");
        }
        request.onsuccess = () => {
            // console.log("Database Opened Successfully");
            DB = request.result;
            displayData();
        }
        request.onupgradeneeded = (e) => {
            let DB = e.target.result;
            console.log(DB);
            let objectStore = DB.createObjectStore("contacts", {
                keypath: 'id',
                autoIncrement: true
            });
            objectStore.createIndex('contactName', 'contactName', {
                unique: false,
            });
            objectStore.createIndex('contactNumber', 'contactNumber', {
                unique: false,
            });
            // console.log("Database Setup Successfully...");
        };
    }
    // End EventListener Window For Create DB

//Start function displayData 
function displayData() {
    while (contactsList.firstChild) {
        contactsList.removeChild(contactsList.firstChild);
    }
    let transaction = DB.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');

    objectStore.openCursor().onsuccess = (e) => {
        let cursor = e.target.result;
        if (cursor) {
            let listItem = document.createElement("li");
            let cName = document.createElement("p");
            let cNumber = document.createElement("p");
            let Divbtn = document.createElement("div");
            let btnDelet = document.createElement("button");
            let btnUpdate = document.createElement("button");
            cName.textContent = cursor.value.contactName;
            cNumber.textContent = cursor.value.contactNumber;
            btnDelet.innerText = "حذف";
            btnUpdate.innerText = "ویرایش";
            listItem.setAttribute("data-contact-id", cursor.primaryKey);
            Divbtn.setAttribute("class", "btn-container");
            btnDelet.setAttribute("class", "btn-delete");
            btnUpdate.setAttribute("class", "btn-update");
            listItem.appendChild(cName);
            listItem.appendChild(cNumber);
            Divbtn.appendChild(btnDelet);
            Divbtn.appendChild(btnUpdate);
            listItem.appendChild(Divbtn);
            contactsList.appendChild(listItem);
            btnDelet.addEventListener("click", deleteItem);
            btnUpdate.addEventListener("click", showUpdate);
            cursor.continue();
        } else if (!contactsList.firstChild) {
            let listItem = document.createElement("li");
            listItem.textContent = "مخاطبی وجود ندارد...!!!";
            contactsList.appendChild(listItem);
        }
    }
}
//End function displayData
//Start function addItem
function addItem(e) {
    e.preventDefault();
    let newItem = {
        contactName: inputName.value,
        contactNumber: inputNumber.value,
    };
    let transaction = DB.transaction(['contacts'], 'readwrite')
    let request = transaction.objectStore("contacts").add(newItem);
    transaction.onsuccess = () => {
        console.log("onsuccess");
    }
    transaction.oncomplete = () => {
        inputName.value = "";
        inputNumber.value = "";
        alert("مخاطب جدید افزوده شد!");
        displayData();
    }
    transaction.onerror = () => {
        alert("عملیات ثبت دچار خطاط شد!!!");
    }
}
//End function addItem
//Start function deleteItem
function deleteItem(e) {
    let cId = Number(e.target.parentElement.parentElement.getAttribute('data-contact-id'));
    let cName = e.target.parentElement.parentElement.children[0].innerText;
    let result = confirm(`آیا از حذف  ${cName} اطمینان دارید!؟`);
    if (result) {

        let transaction = DB.transaction(['contacts'], 'readwrite');
        let request = transaction.objectStore('contacts').delete(cId);
        transaction.oncomplete = () => {
            contactsList.removeChild(e.target.parentElement.parentElement);
            alert(`حذف شد  ${cName}`);
            if (!contactsList.firstChild) {
                let listItem = document.createElement("li");
                listItem.textContent = "مخاطبی وجود ندارد...!!!";
                contactsList.appendChild(listItem);
            }
        }
    }
}
//End function deleteItem
//Start function showUpdate
function showUpdate(e) {
    if (contUpdate.style.display == "flex") {
        alert("ابتدا عملیات جاری را تمام کنید");
    } else if (contUpdate.style.display == "" || "none") {
        let Id = Number(e.target.parentElement.parentElement.getAttribute('data-contact-id'));
        let Name = e.target.parentElement.parentElement.children[0].innerText;
        let phone = e.target.parentElement.parentElement.children[1].innerText;
        contUpdate.style.display = "flex";
        inNameUpdate.value = Name;
        inNumberUpdate.value = phone;
        updateId = Id;
    }
}
//End function showUpdate
//Start function Update Item
function updateItem() {
    if (inNameUpdate.value != "" && inNumberUpdate.value != "") {
        let result = confirm("از بروز رسانی اطمینان دارید!؟");
        if (result) {
            let objectStore = DB.transaction(['contacts'], 'readwrite').objectStore('contacts');
            const objCursor = objectStore.openCursor(updateId);
            objCursor.onsuccess = function(e) {
                let cursor = e.target.result;
                let contact = {
                    contactName: inNameUpdate.value,
                    contactNumber: inNumberUpdate.value
                }
                let request = cursor.update(contact);
                request.onsuccess = function() {
                    alert("بروزرسانی انجام شد");
                    btnClose.click();
                    displayData();
                }
            }
        } else if (!result) {
            btnClose.click();
        }
    } else {
        alert("لطفا مقادیر مربوط را پرکنید!");
    }
}
//End function Update Item
//EventListener For Call Add New Item
frmContact.addEventListener("submit", addItem);
//EventListener For Call Update Item
btnSaveUpdate.addEventListener("click", updateItem);
//EventListener For Cancel update
btnClose.addEventListener("click", () => {
    inNameUpdate.value = "";
    inNumberUpdate.value = "";
    updateId = 0;
    contUpdate.style.display = "none";
});