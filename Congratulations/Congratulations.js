function myFunction() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  ul = document.getElementById("myUL");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function moveItem(item) {
  // Get the parent ul of the clicked li
  var currentList = item.parentElement;

  // Remove the clicked li from its current list
  currentList.removeChild(item);

  // Get the target ul where the li should be added
  var selectedList = document.getElementById("selectedSportsList");

  // Add the removed li to the target ul
  selectedList.appendChild(item);
}
