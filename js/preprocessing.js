// Data on Mass Shootings in the US from 2014 to 2018 (http://www.gunviolencearchive.org)
var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv"];     // saves paths of data sets

// Transform Months from String to Number;
var theYear = {January: "01", February: "02", March: "03", April: "04", May: "05", June: "06", July: "07",
              August: "08", September: "09", October: "10", November: "11", December: "12"};

var count = 0;

var allData = [];


function parseCSV() {
  Promise.all([d3.csv(dataPaths[0]),
              d3.csv(dataPaths[1]),
              d3.csv(dataPaths[2]),
              d3.csv(dataPaths[3])])
  .then(function(data) {
    allData = data;
    // Iterate over all Datasets
    for(count = 0; count < dataPaths.length; ++count) {
      for(var j = 0; j < allData[count].length; ++j) {
        var current_incident = allData[count][j];
        // Change Date for every data entry of ever dataset
        current_incident["Incident Date"] = rewriteDate(current_incident["Incident Date"]);
      }
    }

    calcYear(0);
  }).catch(function(error) {
  });
}

function rewriteDate(date) {
  // convert to international standard date (YYYY-MM-DD)
  var year = date.match(new RegExp('[0-9]{4}'));

  var month = date.match(new RegExp('[a-zA-Z]+'));
  month = theYear[month];

  var day = date.match(new RegExp('[0-9]{1,2}'));
  if(parseInt(day) < 10)
    day = "0" + day;

  return year + "-" + month + "-" + day;
}

// calculates year overview. Takes input number in datapath length to select year.
function calcYear(year) {
  var year_data = [];
  var current_month = allData[year][0]["Incident Date"].match(new RegExp('-[0-1][0-9]-')).toString();
  var current_incident;
  var total_killed = 0;
  var total_injured = 0;

  for(var j = 0; j < allData[year].length; ++j) {
    current_incident = allData[year][j];

    // guarantees the last month to be taken
    if (j == allData[year].length - 1) {
      total_killed += parseInt(current_incident["# Killed"]);
      total_injured += parseInt(current_incident["# Injured"]);
      year_data.push([total_killed, total_injured]);
    } else if(current_incident["Incident Date"].includes(current_month)) {
      total_killed += parseInt(current_incident["# Killed"]);
      total_injured += parseInt(current_incident["# Injured"]);
    } else {
      year_data.push([total_killed, total_injured]);
      current_month = allData[year][j]["Incident Date"].match(new RegExp('-[0-1][0-9]-')).toString();
      total_killed = parseInt(current_incident["# Killed"]);
      total_injured = parseInt(current_incident["# Injured"]);
    }
  }
  
  return year_data;
}
