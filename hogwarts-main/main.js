//https://stackoverflow.com/questions/7759237/how-do-i-pass-an-extra-parameter-to-the-callback-function-in-javascript-filter/27255520#27255520

/* https://petlatkea.dk/2021/hogwarts/students.json */

//Event listener on input, to lowercase, includes

"use strict";

const jsonUrl = {
  student: "https://petlatkea.dk/2021/hogwarts/students.json",
  blood_status: "https://petlatkea.dk/2021/hogwarts/families.json",
};

window.addEventListener("DOMContentLoaded", init);

const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  lastname: "",
  gender: "",
  house: "",
  blood_status: "",
  expelled: false,
  inquisitor: false,
  prefect: false,
  image: "",
};

const settings = {
  filter: "*",
  filterBy: "",
  sortBy: "firstname",
  sortDir: "asc",
  direction: 1,
};

let hacked = false;
let all_students = [];
let filteredList;
let expelled_students = [];

async function init() {
  //wait for json to be loaded THEN assign modal
  await loadJson(jsonUrl.student, jsonUrl.blood_status);

  const modal = document.querySelector("#modal");

  document.querySelectorAll(".first").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".last").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".middle").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".nick").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".gender").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".blood").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".house").forEach((button) => button.addEventListener("click", clickStudent));
  document.querySelectorAll(".expel").forEach((button) => button.addEventListener("click", expelStudent));
  /*   let info = document.querySelectorAll("#data").forEach((button) =>
    button.addEventListener("click", () => {
      console.log("s");
      modal.showModal();
    })
  );
 */
  document.querySelectorAll(".close-button").forEach((button) =>
    button.addEventListener("click", () => {
      modal.close();
    })
  );

  const input = document.querySelector("input");
  input.addEventListener("input", updateValue);
}

/* displayList; */

async function loadJson(students, blood) {
  const response_student = await fetch(students);
  const response_bloods_status = await fetch(blood);
  const json_student = await response_student.json();
  const json_blood_status = await response_bloods_status.json();

  all_students = await mapStudent(json_student, prepareStudentObject);
  let blood_obj = await prepareBloodObject(json_blood_status);
  all_students = await checkBloodStatus(blood_obj, all_students);
  filteredList = all_students;
  let enrolledObj = getEnrolled();
  updateInterface(enrolledObj);
  registerButtons();
  displayList(all_students);
}

function updateInterface(countObj) {
  document.getElementById("total_enrolled").innerHTML = countObj.total_count;
  document.getElementById("huffle_total").innerHTML = countObj.huffle_count;
  document.getElementById("griff_total").innerHTML = countObj.griff_count;
  document.getElementById("raven_total").innerHTML = countObj.raven_count;
  document.getElementById("slyth_total").innerHTML = countObj.slyth_count;
  document.getElementById("expelled_slyth").innerHTML = countObj.expelled_slyth;
  document.getElementById("expelled_gryff").innerHTML = countObj.expelled_gryff;
  document.getElementById("expelled_huffle").innerHTML = countObj.expelled_huffle;
  document.getElementById("expelled_raven").innerHTML = countObj.expelled_raven;
  document.getElementById("total_expelled").innerHTML = countObj.total_expelled;
}

function getEnrolled() {
  let slyth_count = all_students.filter(isSlytherin).length;
  let griff_count = all_students.filter(isGryffindor).length;
  let huffle_count = all_students.filter(isHufflepuff).length;
  let raven_count = all_students.filter(isRavenclaw).length;
  let expelled_slyth = expelled_students.filter(isSlytherin).length;
  let expelled_gryff = expelled_students.filter(isGryffindor).length;
  let expelled_raven = expelled_students.filter(isRavenclaw).length;
  let expelled_huffle = expelled_students.filter(isHufflepuff).length;
  let total_expelled = expelled_students.length;
  let total_count = all_students.length;
  return { total_count, slyth_count, griff_count, huffle_count, raven_count, total_expelled, expelled_slyth, expelled_raven, expelled_huffle, expelled_gryff };
}

function getExpelled() {
  let expelled = all_students.filter(isExpelled);
  expelled.length;
}

function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSorting));
}

function clickStudent(event) {
  //let hej = event.querySelectorAll("first").textContent;
  console.log("event.target", event.target);
  console.log("event.target.parentNode", event.target.parentNode);

  let pop_first = event.target.parentNode.querySelector(".first").textContent;
  let pop_last = event.target.parentNode.querySelector(".last").textContent;
  let pop_middle = event.target.parentNode.querySelector(".middle").textContent;
  let pop_nick = event.target.parentNode.querySelector(".nick").textContent;
  let pop_house = event.target.parentNode.querySelector(".house").textContent;
  let pop_blood = event.target.parentNode.querySelector(".blood").textContent;
  let pop_pref = event.target.parentNode.querySelector(".pref").textContent;

  if (pop_pref === "☆") {
    pop_pref = "";
  }

  document.querySelector(".pop_first").textContent = pop_first;
  document.querySelector(".pop_middle").textContent = pop_middle;
  document.querySelector(".pop_last").textContent = pop_last;
  document.querySelector(".pop_nick").textContent = pop_nick;
  document.querySelector(".pop_house").textContent = pop_house;
  document.querySelector(".pop_blood").textContent = pop_blood;
  document.querySelector(".pop_pref").textContent = pop_pref;

  let first_letter = pop_first.charAt(0);
  pop_last = pop_last.toLowerCase();
  first_letter = first_letter.toLowerCase();
  document.querySelector("#student_img").src = `images/${pop_last.toLowerCase()}_${pop_first[0].toLowerCase()}.png`;

  switch (pop_house) {
    case "Slytherin":
      document.querySelector("#modal").style.backgroundColor = "#366447";
      document.querySelector("#modal").style.backgroundImage = "url('images/ss.png')";

      break;
    case "Hufflepuff":
      document.querySelector("#modal").style.backgroundColor = "#efbc2f";
      document.querySelector("#modal").style.backgroundImage = "url('images/hh.png')";

      break;
    case "Gryffindor":
      document.querySelector("#modal").style.backgroundColor = "#a6332e";
      document.querySelector("#modal").style.backgroundImage = "url('images/gg.png')";

      break;
    case "Ravenclaw":
      document.querySelector("#modal").style.backgroundColor = "#3c4e91";
      document.querySelector("#modal").style.backgroundImage = "url('images/rr.png')";

      break;
  }

  //unhide modal
  modal.showModal();
  all_students.forEach((student) => {
    if (expelled_students.includes(student.last)) {
      //console.log("expelled", student.last);
    }
  });

  console.log("expelled", expelled_students);
}

function expelStudent(event) {
  let pop_first = event.target.parentNode.querySelector(".first").textContent;
  let pop_last = event.target.parentNode.querySelector(".last").textContent;

  let expell_list = all_students.filter(expel);
  let enrolled = getEnrolled();
  updateInterface(enrolled);
  console.log("expell list", expell_list);

  function expel(student) {
    if (student.expelled != true) {
      if (student.lastname != undefined) {
        if (student.firstname === pop_first && student.lastname === pop_last) {
          return true;
        }
        return false;
      } else {
        if (student.firstname === pop_first) {
          return true;
        }
        return false;
      }
    }
  }
}

function selectSorting(element) {
  const sortBy = element.target.dataset.sort;
  const sortDir = element.target.dataset.sortDirection;

  // toggle the direction
  if (sortDir === "asc") {
    element.target.dataset.sortDirection = "desc";
  } else {
    element.target.dataset.sortDirection = "asc";
  }

  const old_element = document.querySelector(`[data-sort="${settings.sortBy}"]`);
  console.log("old", old_element);
  old_element.classList.remove("sortby");
  // indicate active sort
  element.target.classList.add("sortby");
  settings.sortBy = sortBy;

  console.log(sortBy);
  sortList(sortDir);
}

function sortList(sortDir) {
  let sortedList = filteredList;
  let direction = 1;
  if (sortDir === "desc") {
    direction = 1;
  } else {
    direction = -1;
  }

  sortedList = sortedList.sort(sortByProperty);

  console.log("sortedList", sortedList);
  function sortByProperty(studentA, studentB) {
    console.log(`sort is ${settings.sortBy}`);
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  displayList(sortedList);
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`user selected ${filter}`);
  filterList(filter);
}

function filterList(filter) {
  console.log("filter", filter);
  filteredList = all_students;
  console.log("filter list", filteredList);
  if (filter === "boy") {
    filteredList = all_students.filter(isBoy);
  } else if (filter === "girl") {
    console.log("check");
    filteredList = all_students.filter(isGirl);
  } else if (filter === "*") {
    filteredList = all_students.filter(isAll);
  } else if (filter === "gryffindor") {
    filteredList = all_students.filter(isGryffindor);
  } else if (filter === "slytherin") {
    filteredList = all_students.filter(isSlytherin);
  } else if (filter === "hufflepuff") {
    filteredList = all_students.filter(isHufflepuff);
  } else if (filter === "ravenclaw") {
    filteredList = all_students.filter(isRavenclaw);
  } else if (filter === "pure") {
    filteredList = all_students.filter(isPure);
  } else if (filter === "half") {
    filteredList = all_students.filter(isHalf);
  } else if (filter === "muggle") {
    filteredList = all_students.filter(isMuggle);
  } else if (filter === "expelled") {
    filteredList = all_students.filter(isMuggle);
  }
  console.log("filteredList", filteredList);
  displayList(filteredList);
}

function mapStudent(json_object, callback) {
  all_students = json_object.map(callback);
  return all_students;
}

function checkBloodStatus(bloodObj, all_students) {
  all_students.forEach((student) => {
    if (bloodObj.pure_blood.includes(student.lastname) && bloodObj.half_blood.includes(student.lastname)) {
      student.blood_status = "Pure Blood";
    } else if (bloodObj.half_blood.includes(student.lastname)) {
      student.blood_status = "Half Blood";
    } else if (bloodObj.pure_blood.includes(student.lastname)) {
      student.blood_status = "Pure Blood";
    } else {
      student.blood_status = "Muggle";
    }
  });

  return all_students;
}

function prepareStudentObject(json_object) {
  const student = Object.create(Student);
  const split_name = json_object.fullname.trim().split(" ");
  let filter_nickname = split_name.filter((name) => name.includes('"'));
  let names = split_name.filter((name) => !name.includes('"'));
  const number_of_names = names.length;
  if (number_of_names === 1) {
    student.firstname = names[0];
    student.image = `images/${student.firstname.toLowerCase()}.png`;
  } else if (number_of_names === 2) {
    student.firstname = capitalize(names[0]);
    student.lastname = capitalize(names[1]);
    student.image = `images/${student.lastname.toLowerCase()}_${student.firstname[0].toLowerCase()}.png`;
  } else {
    student.firstname = capitalize(names[0]);
    student.middlename = capitalize(names[1]);
    student.lastname = capitalize(names[2]);
    student.image = `images/${student.lastname.toLowerCase()}_${student.firstname[0].toLowerCase()}.png`;
  }
  student.nickname = filter_nickname[0];
  student.gender = capitalize(json_object.gender.trim());
  student.house = capitalize(json_object.house.trim());
  student.blood_status = "Unknown";
  student.expelled = false;
  student.inquisitor = false;
  student.prefect = false;
  return student;
}

function prepareBloodObject(json_object) {
  const pure_blood = json_object.pure;
  const half_blood = json_object.half;
  return { pure_blood, half_blood };
}

function displayList(students) {
  console.log("displaylist", students);
  // clear the list
  document.getElementById("current_list").innerHTML = students.length;
  document.querySelector("#studentList tbody").innerHTML = "";
  // build a new list
  students.forEach(displayStudent);
}

function hackAlert() {
  alert("you are hacked");
}

function displayStudent(student) {
  const clone = document.querySelector("template#student").content.cloneNode(true);
  clone.querySelector("[data-field=image] img").setAttribute("src", student.image);
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=middlename]").textContent = student.middlename;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=blood]").textContent = student.blood_status;
  clone.querySelector("[data-field=house]").textContent = student.house; // append clone to list

  clone.querySelector(`[data-field="expelled"]`).addEventListener("click", () => {
    if (student.firstname === "1337") {
      student.expelled = false;
    } else {
      student.expelled = true;
    }
    console.log(expelled_students);
    if (student.expelled) {
      expelled_students.push(student);
    }
    all_students = all_students.filter((student) => !expelled_students.includes(student));
    let enrolled = getEnrolled();
    updateInterface(enrolled);
    displayList(all_students);
  });

  if (student.prefect === true) {
    clone.querySelector(`[data-field="prefect"]`).textContent = "🧙🏽";
  } else {
    clone.querySelector(`[data-field="prefect"]`).textContent = "☆";
  }
  clone.querySelector(`[data-field="prefect"]`).addEventListener("click", clickPref);

  function clickPref() {
    if (student.prefect) {
      student.prefect = false;
      displayList(all_students);
    } else {
      twoPrefect(student);
      displayList(all_students);
    }
  }

  if (student.inquisitor === true) {
    clone.querySelector(`[data-field="inquisitor"]`).textContent = "⚔️";
  } else {
    clone.querySelector(`[data-field="inquisitor"]`).textContent = "☆";
  }
  clone.querySelector(`[data-field="inquisitor"]`).addEventListener("click", clickInquisitor);

  function clickInquisitor() {
    if (student.inquisitor) {
      student.inquisitor = false;
      displayList(all_students);
    } else if (!student.inquisitor && student.house !== "Slytherin") {
      student.inquisitor = true;
      displayList(all_students);
    } else if (student.house == "Slytherin" && student.blood_status === "Pure Blood") {
      student.inquisitor = true;
      displayList(all_students);
    }
    if (hacked === true) {
      setTimeout(deleteInquisitors, 2000);
    }
  }

  document.querySelector("#studentList tbody").appendChild(clone);
}

function deleteInquisitors() {
  all_students.forEach((student) => {
    if (student.inquisitor === true) {
      console.log(student.inquisitor);
      student.inquisitor = false;
    }
  });
  displayList(all_students);
}

function twoPrefect(selected_student) {
  const prefects = all_students.filter((student) => student.prefect);
  console.log("prefects", prefects);
  const numberOfprefects = prefects.length;
  let other = prefects.filter((student) => student.house === selected_student.house);

  if (other.length >= 2) {
    console.log("popup nu two for each house");
    removeOther(other[0], other[1]);
  } else {
    createPrefect(selected_student);
  }
  console.log(numberOfprefects);
  function removeOther(other_prefect1, other_prefect2) {
    console.log("other pref", other_prefect1);
    console.log("other pref", other_prefect2);
    removePrefect(other);
    createPrefect(selected_student);
    document.querySelector("#remove_a_or_b").classList.remove("hide");

    document.querySelector("#remove_a_or_b .close").addEventListener("click", closeDialog);
    document.querySelector("#remove_a_or_b .remove_a").addEventListener("click", removePrefectA);
    document.querySelector("#remove_a_or_b .remove_b").addEventListener("click", removePrefectB);

    document.querySelector("#pref1").textContent = other_prefect1.firstname;
    document.querySelector("#pref2").textContent = other_prefect2.firstname;

    function closeDialog() {
      document.querySelector("#remove_a_or_b").classList.add("hide");

      document.querySelector("#remove_a_or_b .close").removeEventListener("click", closeDialog);
      document.querySelector("#remove_a_or_b .remove_a").removeEventListener("click", removePrefectA);
      document.querySelector("#remove_a_or_b .remove_b").removeEventListener("click", removePrefectB);
    }

    function removePrefectA() {
      console.log("REMOVE A");
      other_prefect1.prefect = false;
      console.log("OTHER", other);
      displayList(all_students);
      closeDialog();
    }

    function removePrefectB() {
      console.log("REMOVE B");
      other_prefect2.prefect = false;
      console.log("OTHER", other);
      displayList(all_students);
      closeDialog();
    }
  }

  function createPrefect(selected_student) {
    selected_student.prefect = true;
  }

  function removePrefect(selected_student) {
    selected_student.prefect = false;
  }
}

function capitalize(string) {
  let removeFirst = string.substring(1).toLowerCase();
  string.toLowerCase();
  let firstletter = string.substring(0, 1).toUpperCase();
  let result = firstletter.concat(removeFirst);
  return result;
}

function isGirl(student) {
  if (student.gender === "Girl") {
    return true;
  }
  return false;
}

function isBoy(student) {
  if (student.gender === "Boy") {
    return true;
  }
  return false;
}

function isGryffindor(student) {
  if (student.house === "Gryffindor") {
    return true;
  }
  return false;
}

function isHufflepuff(student) {
  if (student.house === "Hufflepuff") {
    return true;
  }
  return false;
}

function isSlytherin(student) {
  if (student.house === "Slytherin") {
    return true;
  }
  return false;
}

function isRavenclaw(student) {
  if (student.house === "Ravenclaw") {
    return true;
  }
  return false;
}

function isHalf(student) {
  if (student.blood_status === "Half Blood") {
    return true;
  }
  return false;
}
function isPure(student) {
  if (student.blood_status === "Pure Blood") {
    return true;
  }
  return false;
}
function isMuggle(student) {
  if (student.blood_status === "Muggle") {
    return true;
  }
  return false;
}

function isExpelled(student) {
  if (student.expelled === "Expelled") {
    return true;
  }
  return false;
}

function isAll() {
  return true;
}

//HACKING

function hackTheSystem() {
  if (hacked === false) {
    all_students.push(injectHacker());
    hacked = true;
  }

  all_students.forEach((student) => {
    if (student.blood_status === "Muggle") {
      student.blood_status = "Pure Blood";
    } else if (student.blood_status === "Half Blood") {
      student.blood_status = "Pure Blood";
    } else if (student.blood_status === "Pure Blood") {
      let random = Math.floor(Math.random() * 3);
      switch (random) {
        case 0:
          student.blood_status = "Pure Blood";
          console.log(random);

        case 1:
          student.blood_status = "Muggle";
          console.log(random);

        case 2:
          student.blood_status = "Half Blood";
          console.log(random);
      }
    }
  });

  console.log(all_students);
  displayList(all_students);
}

function injectHacker() {
  const student = Object.create(Student);
  student.firstname = "1337";
  student.middlename = "";
  student.lastname = "H4X0R";
  student.nickname = "Script Kiddo";
  student.gender = "Boy";
  student.house = "Slytherin";
  student.inquisitor = true;
  student.blood_status = "Pure Blood";
  student.expelled = false;
  student.prefect = true;
  student.image = "";
  return student;
}

function updateValue(letter) {
  let findName = letter.target.value;
  console.log(findName, all_students);
  const result = all_students.filter(search);
  function search(student) {
    let text = student.firstname;
    //text = text.toLowerCase;

    if (text.startsWith(findName)) {
      return true;
    } else {
      return false;
    }
  }

  displayList(result);

  if (findName === "1337") {
    hackTheSystem();
    alert("system injected");
  }
}
