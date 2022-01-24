function func1() {
  var types = document.getElementsByName("type");
  for(var i = 0; i < types.length; i++){
    if(types[i].checked) {
      console.log("value：", types[i].value);
      document.typebox.submit();
    }
  }
}

function func2() {
  var years = document.yearbox.year;
  console.log("value：", years.options[years.selectedIndex].value);
  document.yearbox.submit();
}

function func3() {
  var annivs = document.getElementsByName("anniversary");
  for(var i = 0; i < annivs.length; i++){
    if(annivs[i].checked) {
      console.log("value：", annivs[i].value);
      document.annivbox.submit();
    }
  }
}

function func4() {
  var fixes = document.getElementsByName("fixed");
  for(var i = 0; i < fixes.length; i++){
    if(fixes[i].checked) {
      console.log("value：", fixes[i].value);
      document.fixbox.submit();
    }
  }
}